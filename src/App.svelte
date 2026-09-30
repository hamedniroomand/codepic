<script lang="ts">
  import { ShieldCheck, Code2 } from '@lucide/svelte';
  import { Tooltip } from 'bits-ui';
  import { onMount, untrack } from 'svelte';
  import '@fontsource-variable/inter';

  import '@fontsource/jetbrains-mono/400.css';
  import PreviewStage from '$components/preview/PreviewStage.svelte';
  import ShortcutsHelp from '$components/ShortcutsHelp.svelte';
  import SiteHeader from '$components/SiteHeader.svelte';
  import SettingsInspector from '$components/toolbar/SettingsInspector.svelte';
  import SettingsPanel from '$components/toolbar/SettingsPanel.svelte';
  import Toast from '$components/ui/Toast.svelte';
  import type { AppearanceConfig } from '$lib/config/appearance-config';
  import { mergeAppearance } from '$lib/config/appearance-config';
  import { createExporter } from '$lib/export/exporter.svelte';
  import { createHighlightState } from '$lib/highlight/highlight.svelte';
  import { createLanguageDetection } from '$lib/highlight/language-detection.svelte';
  import type { LineMarks } from '$lib/marks/line-marks';
  import { saveAppearance } from '$lib/persistence/persistence';
  import { createPresetStore } from '$lib/presets/presets.svelte';
  import type { Boot } from '$lib/share/boot';
  import { buildShareUrl } from '$lib/share/share-url';
  import { createShareUsage } from '$lib/share/share-usage.svelte';
  import { matchShortcut, type ShortcutAction } from '$lib/shortcuts/shortcuts';

  type Props = { boot: Boot };
  let { boot }: Props = $props();
  const initial = untrack(() => boot);

  let mobile = $state(window.matchMedia('(max-width: 959px)').matches);
  let settingsOpen = $state(false);
  let helpOpen = $state(false);
  const presetStore = createPresetStore();
  onMount(() => {
    const media = window.matchMedia('(max-width: 959px)');
    const update = (): void => {
      mobile = media.matches;
      settingsOpen = false;
    };
    media.addEventListener('change', update);
    return (): void => media.removeEventListener('change', update);
  });

  const STATUS_TIMEOUT_MS = 6000;

  let appearance = $state<AppearanceConfig>(initial.appearance);
  let code = $state(initial.code);
  let marks = $state<LineMarks>(initial.marks);
  let status = $state(initial.notice);
  let exportNode = $state<HTMLDivElement | null>(null);

  const setStatus = (message: string): string => (status = message);
  const highlight = createHighlightState(
    () => ({ code, language: appearance.language, themeId: appearance.themeId }),
    setStatus,
  );
  const shareUsage = createShareUsage(() => ({ appearance, code, marks }));
  const exporter = createExporter(
    () => ({ node: exportNode, appearance, highlightSettled: highlight.settled }),
    setStatus,
  );

  function patch(next: Partial<AppearanceConfig>): void {
    if (exporter.busy) return;
    appearance = mergeAppearance(appearance, next);
  }

  function changeMarks(next: LineMarks): void {
    if (!exporter.busy) marks = next;
  }

  const languageDetection = createLanguageDetection((language) => patch({ language }));

  function changeFromDock(next: Partial<AppearanceConfig>): void {
    if (exporter.busy) return;
    if (next.language !== undefined) languageDetection.pick();
    patch(next);
  }

  async function shareLink(): Promise<void> {
    const { url, codeOmitted } = await buildShareUrl({ appearance, code, marks });
    try {
      await navigator.clipboard.writeText(url);
      setStatus(codeOmitted ? 'Link copied. The code was too long to include.' : 'Link copied.');
    } catch {
      setStatus('Clipboard access was denied.');
    }
  }

  const shortcutActions: Record<ShortcutAction, () => void> = {
    download: () => exporter.run('download'),
    copyImage: () => exporter.run('copy'),
    shareLink: () => shareLink(),
    toggleSettings: () => {
      if (mobile) settingsOpen = !settingsOpen;
      else
        document
          .querySelector<HTMLElement>('#codepic-inspector button, #codepic-inspector input')
          ?.focus();
    },
    focusEditor: () => document.querySelector<HTMLTextAreaElement>('textarea')?.focus(),
    showHelp: () => {
      helpOpen = !helpOpen;
    },
  };

  function onKeydown(event: KeyboardEvent): void {
    const action = matchShortcut(event);
    if (!action) return;
    event.preventDefault();
    shortcutActions[action]();
  }

  $effect(() => saveAppearance(appearance));

  $effect(() => {
    if (!status) return;
    const timer = setTimeout(() => (status = ''), STATUS_TIMEOUT_MS);
    return (): void => clearTimeout(timer);
  });
</script>

<svelte:head><title>CodePic · Code to image</title></svelte:head>
<svelte:window onkeydown={onKeydown} />

<Tooltip.Provider delayDuration={350}>
  <div class="shell">
    <SiteHeader
      busy={exporter.busy}
      exportFormat={appearance.exportFormat}
      shareRatio={shareUsage.ratio}
      pending={exporter.pending}
      onShare={shareLink}
      onCopy={() => exporter.run('copy')}
      onDownload={() => exporter.run('download')}
    />
    <div class="workspace">
      <main
        class="canvas"
        inert={exporter.busy}
        onpaste={languageDetection.onPaste}
      >
        <div class="canvas-heading">
          <div><Code2 size={16} /><span>Your snapshot</span></div>
          <span class="canvas-note">Click the code to edit</span>
        </div>
        <PreviewStage
          {appearance}
          lines={highlight.lines}
          {marks}
          bind:code
          exportRef={(element) => (exportNode = element)}
          onChange={patch}
          onMarksChange={changeMarks}
        />
        <footer class="about">
          <div class="privacy">
            <ShieldCheck size={14} /><span>Your code stays on your device.</span>
          </div>
          <div class="footer-links">
            <a
              href="https://github.com/hamedniroomand"
              target="_blank"
              rel="noreferrer">Built by Hamed</a
            ><span
              >Inspired by <a
                href="https://ray.so/"
                target="_blank"
                rel="noreferrer">Ray.so</a
              ></span
            ><ShortcutsHelp bind:open={helpOpen} />
          </div>
        </footer>
      </main>
      <SettingsPanel
        {mobile}
        bind:open={settingsOpen}
        busy={exporter.busy}
      >
        <SettingsInspector
          {appearance}
          {marks}
          store={presetStore}
          languageDetected={languageDetection.detected}
          onChange={changeFromDock}
          onMarksChange={changeMarks}
          onStatus={setStatus}
        />
      </SettingsPanel>
    </div>
    {#if status}<Toast message={status} />{/if}
  </div>
</Tooltip.Provider>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    height: 100svh;
    background: var(--surface-base);
    color: var(--text-strong);
  }
  .workspace {
    flex: 1;
    display: flex;
    min-height: 0;
  }
  .canvas {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    overflow-y: auto;
  }
  .canvas-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 23px 32px 0;
    flex-shrink: 0;
  }
  .canvas-heading > div {
    display: flex;
    gap: 9px;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-base);
  }
  .canvas-heading :global(svg) {
    color: var(--text-muted);
  }
  .canvas-note {
    color: var(--text-muted);
    font-size: 12px;
  }
  .about {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 12px 28px 20px;
    flex-shrink: 0;
  }
  .privacy {
    display: flex;
    gap: 7px;
    align-items: center;
    color: var(--text-muted);
    font-size: 11px;
  }
  .privacy :global(svg) {
    color: #8daab7;
  }
  .footer-links {
    display: flex;
    gap: 16px;
    align-items: center;
    color: var(--text-muted);
    font-size: 11px;
  }
  .footer-links a {
    color: var(--text-muted);
    text-decoration: none;
  }
  .footer-links a:hover {
    color: var(--text-strong);
  }
  .footer-links :global(.dialog-trigger) {
    border-color: transparent;
    font-size: 11px;
    min-height: 30px;
    padding: 0 6px;
  }
  @media (max-width: 1190px) {
    .about {
      flex-direction: column;
      gap: 6px;
      padding-bottom: 14px;
    }
  }
  @media (max-width: 959px) {
    .shell {
      height: auto;
      min-height: 100svh;
    }
    .workspace {
      flex: 1;
    }
    .canvas {
      overflow: visible;
      padding-bottom: calc(76px + env(safe-area-inset-bottom));
    }
    .canvas-heading {
      padding: 24px 20px 0;
    }
    .canvas-note {
      display: none;
    }
    .about {
      margin-top: auto;
    }
  }
  @media (max-width: 480px) {
    .footer-links {
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
