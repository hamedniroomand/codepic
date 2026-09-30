<script lang="ts">
  import { Code2, Link, Copy, Download } from '@lucide/svelte';
  import { Button as ButtonPrimitive } from 'bits-ui';

  import Button from '$components/ui/Button.svelte';
  import Spinner from '$components/ui/Spinner.svelte';
  import type { ExportFormat } from '$lib/config/appearance-config';
  import type { ExportAction } from '$lib/export/exporter.svelte';

  type Props = {
    busy: boolean;
    exportFormat: ExportFormat;
    pending: ExportAction | null;
    shareRatio: number;
    onShare: () => void;
    onCopy: () => void;
    onDownload: () => void;
  };
  let { busy, exportFormat, pending, shareRatio, onShare, onCopy, onDownload }: Props = $props();
</script>

<header>
  <a
    class="brand"
    href="./"
    aria-label="CodePic home"
    ><span class="mark"
      ><Code2
        size={21}
        strokeWidth={1.8}
      /></span
    ><span>CodePic</span><span class="tagline">Code to image</span></a
  >
  <nav aria-label="Image actions">
    <ButtonPrimitive.Root
      class="github"
      href="https://github.com/hamedniroomand/codepic"
      target="_blank"
      rel="noreferrer"
      aria-label="CodePic on GitHub"
      title="CodePic on GitHub"
      ><svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        ><path
          d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1 2 .78 3.27.55.1-.73.4-1.23.71-1.51-2.5-.29-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.09 1.16A10.75 10.75 0 0 1 12 5.77c.96 0 1.92.13 2.82.38 2.14-1.45 3.08-1.16 3.08-1.16.61 1.55.23 2.69.11 2.98.73.79 1.16 1.79 1.16 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.5c0 .3.2.65.77.54A11.25 11.25 0 0 0 12 .75Z"
        /></svg
      ><span>GitHub</span></ButtonPrimitive.Root
    >
    <span
      class="divider"
      aria-hidden="true"
    ></span>
    <Button
      variant="subtle"
      label="Copy share link"
      disabled={busy}
      onclick={onShare}><Link size={16} /><span class="wide-only">Share link</span></Button
    >
    {#if shareRatio >= 0.5}<meter
        class="share-meter"
        min="0"
        max="1"
        low="0.75"
        high="0.9"
        optimum="0"
        value={Math.min(shareRatio, 1)}
        title={shareRatio > 1
          ? 'Too large for a link. The code will be left out.'
          : `Share link is ${Math.round(shareRatio * 100)}% of the size limit`}
      ></meter>{/if}
    <Button
      label="Copy image"
      busy={pending === 'copy'}
      disabled={busy}
      onclick={onCopy}
      >{#if pending === 'copy'}<Spinner label="Copying image" />{:else}<Copy size={16} />{/if}<span
        class="wide-only">Copy image</span
      ></Button
    >
    <Button
      variant="primary"
      label="Download {exportFormat.toUpperCase()}"
      busy={pending === 'download'}
      disabled={busy}
      onclick={onDownload}
      >{#if pending === 'download'}<Spinner label="Creating image" />{:else}<Download
          size={16}
        />{/if}<span>Download<span class="format">{' '}{exportFormat.toUpperCase()}</span></span
      ></Button
    >
  </nav>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 76px;
    padding: 0 28px;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--surface-base);
    flex-shrink: 0;
    box-sizing: border-box;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-strong);
    font-size: 20px;
    font-weight: 650;
    letter-spacing: -0.6px;
    text-decoration: none;
  }
  .mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid var(--accent-ring);
    border-radius: 10px;
    color: var(--accent);
    background: var(--accent-surface);
  }
  .tagline {
    margin-left: 8px;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0;
  }
  nav {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  :global(.github) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px;
    color: var(--text-muted);
    text-decoration: none;
    font-size: 12px;
    border-radius: 8px;
  }
  :global(.github:hover) {
    background: var(--surface-active);
    color: var(--text-strong);
  }
  .divider {
    height: 24px;
    width: 1px;
    background: var(--border-base);
    margin: 0 4px;
  }
  .share-meter {
    width: 32px;
  }
  @media (max-width: 760px) {
    header {
      padding: 0 16px;
      min-height: 68px;
    }
    .tagline,
    .wide-only,
    :global(.github) span,
    .divider {
      display: none;
    }
    nav {
      gap: 6px;
    }
    :global(.github) {
      padding: 8px;
    }
  }
  @media (max-width: 480px) {
    header {
      padding: 0 12px;
      gap: 8px;
    }
    .brand {
      font-size: 17px;
      gap: 7px;
    }
    .mark {
      width: 28px;
      height: 28px;
      border-radius: 8px;
    }
    nav {
      gap: 4px;
    }
    nav :global(button) {
      padding: 0 9px;
      min-height: 36px;
      gap: 6px;
    }
    .format {
      display: none;
    }
    .share-meter {
      position: absolute;
      top: 62px;
      right: 12px;
    }
  }
  @media (max-width: 380px) {
    .brand .mark {
      display: none;
    }
    :global(.github) {
      padding: 6px;
    }
    nav :global(button) {
      padding: 0 8px;
    }
  }
</style>
