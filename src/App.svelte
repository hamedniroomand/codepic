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
  import { loadCodeFont } from '$lib/fonts/load-code-font';
  import { createHighlightState } from '$lib/highlight/highlight.svelte';
  import { createLanguageDetection } from '$lib/highlight/language-detection.svelte';
  import { MAX_ANNOTATIONS, rangeFromSelection, type Annotation } from '$lib/marks/annotations';
  import type { LineMarks } from '$lib/marks/line-marks';
  import { MAX_PANELS, newPanel, type Panel } from '$lib/panels/panels';
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
  let annotations = $state<Annotation[]>(initial.annotations);
  let extraPanels = $state<Panel[]>(initial.extraPanels);
  let activePanel = $state(0);
  let selection = $state({ panel: 0, start: 0, end: 0 });
  // Only App knows that the first panel keeps its language and filename in the appearance.
  let panels = $derived<Panel[]>([
    { code, language: appearance.language, title: appearance.title, marks, annotations },
    ...extraPanels,
  ]);
  let active = $derived(panels[activePanel] ?? panels[0]);
  // A string, so a change to marks, annotations or a title does not start a new highlight.
  let highlightKey = $derived(
    JSON.stringify(panels.map(({ code, language }) => ({ code, language }))),
  );
  let status = $state(initial.notice);
  let exportNode = $state<HTMLDivElement | null>(null);

  const setStatus = (message: string): string => (status = message);
  const highlight = createHighlightState(
    () => ({ panels: JSON.parse(highlightKey) as Panel[], themeId: appearance.themeId }),
    setStatus,
  );
  const shareUsage = createShareUsage(() => ({
    appearance,
    code,
    marks,
    annotations,
    extraPanels,
  }));
  const exporter = createExporter(
    () => ({ node: exportNode, appearance, highlightSettled: highlight.settled }),
    setStatus,
  );

  function patch(next: Partial<AppearanceConfig>): void {
    if (exporter.busy) return;
    appearance = mergeAppearance(appearance, next);
  }

  function changePanel(index: number, next: Partial<Panel>): void {
    // Typing is never dropped, as before panels. Other changes wait for the export.
    if (exporter.busy && Object.keys(next).some((key) => key !== 'code')) return;
    if (index > 0) {
      extraPanels = extraPanels.map((panel, at) =>
        at === index - 1 ? { ...panel, ...next } : panel,
      );
      return;
    }
    if (next.code !== undefined) code = next.code;
    if (next.marks) marks = next.marks;
    if (next.annotations) annotations = next.annotations;
    if (next.language !== undefined || next.title !== undefined) {
      const { language = appearance.language, title = appearance.title } = next;
      patch({ language, title });
    }
  }

  function addPanel(): void {
    if (exporter.busy || panels.length >= MAX_PANELS) return;
    extraPanels = [...extraPanels, newPanel(appearance.language)];
    activePanel = panels.length;
  }

  function removePanel(index: number): void {
    if (exporter.busy || index === 0) return;
    extraPanels = extraPanels.filter((_, at) => at !== index - 1);
    if (activePanel >= index) activePanel = Math.max(0, activePanel - 1);
    selection = { panel: activePanel, start: 0, end: 0 };
  }

  /** Annotates the selected text, or the whole line of the caret when nothing is selected. */
  function annotateSelection(): void {
    // The settings show the active panel, so the annotation goes there. A selection from
    // another panel does not apply, so the first line gets it.
    const panel = active;
    const { start, end } = selection.panel === activePanel ? selection : { start: 0, end: 0 };
    if (panel.annotations.length >= MAX_ANNOTATIONS) {
      setStatus(`You can add up to ${MAX_ANNOTATIONS} annotations.`);
      return;
    }
    const range = rangeFromSelection(panel.code, start, end);
    changePanel(activePanel, {
      annotations: [...panel.annotations, { ...range, kind: 'box' }],
    });
  }

  // A paste fills the panel whose text field it lands in. Only the first panel's language
  // shows the "(detected)" label, and a language the user picks stops detection.
  const languageDetection = createLanguageDetection((language, editor) => {
    const index = [...document.querySelectorAll('main textarea')].indexOf(editor);
    changePanel(Math.max(0, index), { language });
  });

  function changeFromDock(next: Partial<AppearanceConfig>): void {
    if (exporter.busy) return;
    const { language, title, ...rest } = next;
    if (language !== undefined && activePanel === 0) languageDetection.pick();
    if (language !== undefined || title !== undefined)
      changePanel(activePanel, { language, title });
    if (Object.keys(rest).length) patch(rest);
  }

  async function shareLink(): Promise<void> {
    const { url, codeOmitted } = await buildShareUrl({
      appearance,
      code,
      marks,
      annotations,
      extraPanels,
    });
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
    focusEditor: () =>
      document.querySelectorAll<HTMLTextAreaElement>('main textarea')[activePanel]?.focus(),
    annotate: () => annotateSelection(),
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
    loadCodeFont(appearance.codeFont).catch(() => {});
  });

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
          {panels}
          lines={highlight.lines}
          onSelect={(next) => {
            selection = next;
            activePanel = next.panel;
          }}
          exportRef={(element) => (exportNode = element)}
          onChange={patch}
          onPanelChange={changePanel}
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
          appearance={{ ...appearance, language: active.language, title: active.title }}
          marks={active.marks}
          annotations={active.annotations}
          {panels}
          {activePanel}
          store={presetStore}
          languageDetected={languageDetection.detected && activePanel === 0}
          onChange={changeFromDock}
          onMarksChange={(next) => changePanel(activePanel, { marks: next })}
          onAnnotationsChange={(next) => changePanel(activePanel, { annotations: next })}
          onAnnotate={annotateSelection}
          onActivatePanel={(index) => (activePanel = index)}
          onAddPanel={addPanel}
          onRemovePanel={removePanel}
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
