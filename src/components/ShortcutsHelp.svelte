<script lang="ts">
  import Popover from '$components/ui/Popover.svelte';
  import { HELP_PANEL_ID, SHORTCUTS, formatShortcut } from '$lib/shortcuts/shortcuts';

  const mac = /Mac|iPhone|iPad/.test(navigator.userAgent);
</script>

<Popover
  id={HELP_PANEL_ID}
  label="Keyboard shortcuts"
>
  {#snippet trigger()}
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="5"
        width="15"
        height="10"
        rx="2"
      />
      <path d="M6 9h.01M10 9h.01M14 9h.01M7 12h6" />
    </svg>
  {/snippet}

  <h2>Keyboard shortcuts</h2>
  <dl>
    {#each SHORTCUTS as shortcut (shortcut.action)}
      <dt>{shortcut.label}</dt>
      <dd><kbd>{formatShortcut(shortcut, mac)}</kbd></dd>
    {/each}
  </dl>
</Popover>

<style>
  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentcolor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  h2 {
    margin: 0 0 var(--space-sm);
    font-size: var(--text-label);
    font-weight: var(--weight-label);
    color: var(--text-muted);
  }
  dl {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-xs) var(--space-lg);
    margin: 0;
  }
  dt,
  dd {
    margin: 0;
    font-size: var(--text-label);
  }
  kbd {
    font-family: var(--font-mono);
    color: var(--text-strong);
  }
</style>
