<script lang="ts">
  import { untrack } from 'svelte';
  import '@fontsource-variable/inter';

  import '@fontsource/jetbrains-mono/400.css';
  import PreviewStage from '$components/preview/PreviewStage.svelte';
  import ShortcutsHelp from '$components/ShortcutsHelp.svelte';
  import SiteHeader from '$components/SiteHeader.svelte';
  import ControlDock from '$components/toolbar/ControlDock.svelte';
  import Toast from '$components/ui/Toast.svelte';
  import type { AppearanceConfig } from '$lib/config/appearance-config';
  import { mergeAppearance } from '$lib/config/appearance-config';
  import { createExporter } from '$lib/export/exporter.svelte';
  import { createHighlightState } from '$lib/highlight/highlight.svelte';
  import { createLanguageDetection } from '$lib/highlight/language-detection.svelte';
  import type { LineMarks } from '$lib/marks/line-marks';
  import { saveAppearance } from '$lib/persistence/persistence';
  import type { Boot } from '$lib/share/boot';
  import { buildShareUrl } from '$lib/share/share-url';
  import { createShareUsage } from '$lib/share/share-usage.svelte';
  import {
    HELP_PANEL_ID,
    SETTINGS_PANEL_ID,
    matchShortcut,
    type ShortcutAction,
  } from '$lib/shortcuts/shortcuts';

  type Props = { boot: Boot };
  let { boot }: Props = $props();
  const initial = untrack(() => boot);

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
    appearance = mergeAppearance(appearance, next);
  }

  const languageDetection = createLanguageDetection((language) => patch({ language }));

  function changeFromDock(next: Partial<AppearanceConfig>): void {
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
    toggleSettings: () => document.getElementById(SETTINGS_PANEL_ID)?.togglePopover(),
    focusEditor: () => document.querySelector<HTMLTextAreaElement>('textarea')?.focus(),
    showHelp: () => document.getElementById(HELP_PANEL_ID)?.togglePopover(),
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

  <main
    class="workspace"
    inert={exporter.busy}
    onpaste={languageDetection.onPaste}
  >
    <PreviewStage
      {appearance}
      lines={highlight.lines}
      {marks}
      bind:code
      exportRef={(element) => (exportNode = element)}
      onChange={patch}
      onMarksChange={(next) => (marks = next)}
    />
  </main>

  <div
    class="dock-slot"
    inert={exporter.busy}
  >
    <ControlDock
      {appearance}
      {marks}
      languageDetected={languageDetection.detected}
      onChange={changeFromDock}
      onMarksChange={(next) => (marks = next)}
      onStatus={setStatus}
    />
  </div>

  <footer class="about">
    <ShortcutsHelp />
    <p>
      CodePic runs in your browser. Your code stays on your device. Inspired by
      <a
        href="https://ray.so/"
        rel="noreferrer"
        target="_blank">Ray.so</a
      >.
    </p>
  </footer>

  {#if status}<Toast message={status} />{/if}
</div>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    min-height: 100svh;
    background: var(--surface-base);
    color: var(--text-strong);
  }
  .workspace {
    flex: 1;
    display: flex;
    min-height: 0;
  }
  .dock-slot {
    position: sticky;
    bottom: var(--space-lg);
    z-index: 20;
  }
  .about {
    padding: var(--space-lg) var(--space-lg) var(--space-lg);
    text-align: center;
  }
  .about p {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--text-label);
  }
  .about a {
    color: var(--text-base);
  }
</style>
