<script lang="ts">
  import { Keyboard } from '@lucide/svelte';

  import Dialog from '$components/ui/Dialog.svelte';
  import { SHORTCUTS, formatShortcut } from '$lib/shortcuts/shortcuts';

  let { open = $bindable(false) }: { open?: boolean } = $props();
  const mac = /Mac|iPhone|iPad/.test(navigator.userAgent);
</script>

<Dialog
  bind:open
  title="Keyboard shortcuts"
  description="A few shortcuts to keep you in the flow."
>
  {#snippet trigger()}<Keyboard size={15} /><span>Shortcuts</span>{/snippet}
  <dl>
    {#each SHORTCUTS as shortcut (shortcut.action)}<div class="shortcut">
        <dt>{shortcut.label}</dt>
        <dd><kbd>{formatShortcut(shortcut, mac)}</kbd></dd>
      </div>{/each}
  </dl>
</Dialog>

<style>
  dl {
    margin: 0;
  }
  .shortcut {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    min-height: 46px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .shortcut:last-child {
    border-bottom: 0;
  }
  dt,
  dd {
    margin: 0;
    font-size: 13px;
  }
  kbd {
    display: inline-block;
    padding: 5px 9px;
    border: 1px solid var(--border-base);
    border-bottom-width: 2px;
    border-radius: 6px;
    background: var(--surface-well);
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--text-strong);
    white-space: nowrap;
  }
</style>
