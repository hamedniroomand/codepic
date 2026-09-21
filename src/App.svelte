<script lang="ts">
  import '@fontsource-variable/inter';
  import '@fontsource/jetbrains-mono/400.css';
  import PreviewStage from '$components/preview/PreviewStage.svelte';
  import SiteHeader from '$components/SiteHeader.svelte';
  import ControlDock from '$components/toolbar/ControlDock.svelte';
  import Toast from '$components/ui/Toast.svelte';
  import type { AppearanceConfig } from '$lib/appearance-config';
  import { mergeAppearance } from '$lib/appearance-config';
  import { DEFAULT_CODE } from '$lib/default-code';
  import { createExporter } from '$lib/exporter.svelte';
  import { createHighlightState } from '$lib/highlight.svelte';
  import { loadAppearance, saveAppearance } from '$lib/persistence';
  import { buildShareUrl, parseShareFromLocation } from '$lib/share-url';

  const STATUS_TIMEOUT_MS = 6000;
  const shared = parseShareFromLocation();

  let appearance = $state<AppearanceConfig>(shared.appearance ?? loadAppearance());
  let code = $state(shared.code ?? DEFAULT_CODE);
  let status = $state('');
  let exportNode = $state<HTMLDivElement | null>(null);

  const setStatus = (message: string): string => (status = message);
  const highlight = createHighlightState(
    () => ({ code, language: appearance.language, themeId: appearance.themeId }),
    setStatus,
  );
  const exporter = createExporter(
    () => ({ node: exportNode, appearance, highlightSettled: highlight.settled }),
    setStatus,
  );

  function patch(next: Partial<AppearanceConfig>): void {
    appearance = mergeAppearance(appearance, next);
  }

  async function shareLink(): Promise<void> {
    const { url, codeOmitted } = buildShareUrl(appearance, code);
    try {
      await navigator.clipboard.writeText(url);
      setStatus(codeOmitted ? 'Link copied. The code was too long to include.' : 'Link copied.');
    } catch {
      setStatus('Clipboard access was denied.');
    }
  }

  $effect(() => saveAppearance(appearance));

  $effect(() => {
    if (!status) return;
    const timer = setTimeout(() => (status = ''), STATUS_TIMEOUT_MS);
    return (): void => clearTimeout(timer);
  });
</script>

<svelte:head><title>CodePic · Code to image</title></svelte:head>

<div class="shell">
  <SiteHeader
    busy={exporter.busy}
    pending={exporter.pending}
    onShare={shareLink}
    onCopy={() => exporter.run('copy')}
    onDownload={() => exporter.run('download')}
  />

  <main
    class="workspace"
    inert={exporter.busy}
  >
    <PreviewStage
      {appearance}
      lines={highlight.lines}
      bind:code
      exportRef={(element) => (exportNode = element)}
      onChange={patch}
    />
  </main>

  <div
    class="dock-slot"
    inert={exporter.busy}
  >
    <ControlDock
      {appearance}
      onChange={patch}
    />
  </div>

  <footer class="about">
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
