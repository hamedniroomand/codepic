<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = { label: string; trigger: Snippet; children: Snippet };
  let { label, trigger, children }: Props = $props();

  // The native popover gives light dismiss and top-layer stacking with no script.
  const panelId = $props.id();
</script>

<button
  type="button"
  class="trigger"
  popovertarget={panelId}
  aria-label={label}
  title={label}
>
  {@render trigger()}
</button>

<div
  id={panelId}
  class="panel"
  popover="auto"
>
  {@render children()}
</div>

<style>
  .trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--control-height);
    height: var(--control-height);
    padding: 0;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
  }
  .trigger:hover {
    background: var(--surface-hover);
    color: var(--text-strong);
  }
  .panel {
    position: fixed;
    inset: auto;
    bottom: var(--popover-bottom, 116px);
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    padding: var(--space-lg);
    width: min(520px, calc(100vw - var(--space-md)));
    box-sizing: border-box;
    border: 1px solid var(--border-base);
    border-radius: var(--radius-lg);
    background: var(--surface-raised);
    color: var(--text-base);
    box-shadow: var(--shadow-popover);
  }
  .panel:not(:popover-open) {
    display: none;
  }
</style>
