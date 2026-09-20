<script lang="ts">
  import Button from '$components/ui/Button.svelte';

  type Props = {
    busy: boolean;
    onShare: () => void;
    onCopy: () => void;
    onDownload: () => void;
  };
  let { busy, onShare, onCopy, onDownload }: Props = $props();
</script>

<header class="header">
  <a
    class="brand"
    href="./"
    aria-label="CodePic home"
  >
    <span
      class="mark"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24">
        <path d="M9 8 4.5 12 9 16" />
        <path d="M15 8l4.5 4L15 16" />
        <path d="M13.5 6 10.5 18" />
      </svg>
    </span>
    <span>CodePic</span>
    <span class="tagline">Code to image</span>
  </a>

  <nav aria-label="Image actions">
    <Button
      label="Copy share link"
      onclick={onShare}
    >
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M8 12a3 3 0 0 0 4.5.4l2.7-2.7a3 3 0 0 0-4.2-4.2l-1.1 1" />
        <path d="M12 8a3 3 0 0 0-4.5-.4L4.8 10.3a3 3 0 0 0 4.2 4.2l1-1" />
      </svg>
      <span class="wide-only">Share link</span>
    </Button>

    <Button
      label="Copy image"
      disabled={busy}
      onclick={onCopy}
    >
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <rect
          x="7"
          y="7"
          width="10"
          height="10"
          rx="2"
        />
        <path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      </svg>
      <span class="wide-only">Copy image</span>
    </Button>

    <Button
      variant="primary"
      disabled={busy}
      onclick={onDownload}
    >
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M10 2v10m-4-4 4 4 4-4M3 12v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
      </svg>
      {busy ? 'Creating image…' : 'Download PNG'}
    </Button>
  </nav>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--space-md);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--text-strong);
    font-size: var(--text-headline-md);
    font-weight: 650;
    letter-spacing: -0.5px;
    text-decoration: none;
  }
  .mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background: var(--surface-well);
    color: var(--accent);
  }
  .mark svg {
    width: 22px;
    height: 22px;
    stroke-width: 2;
  }
  .tagline {
    margin-left: var(--space-xs);
    padding-left: var(--space-lg);
    border-left: 1px solid var(--border-base);
    color: var(--text-muted);
    font-size: var(--text-body-sm);
    font-weight: 400;
    letter-spacing: 0;
  }
  nav {
    display: flex;
    gap: var(--space-xs);
  }
  svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentcolor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  @media (max-width: 720px) {
    .header {
      padding: var(--space-sm);
    }
    .tagline,
    .wide-only {
      display: none;
    }
    .brand {
      gap: var(--space-xs);
      font-size: 16px;
    }
  }
</style>
