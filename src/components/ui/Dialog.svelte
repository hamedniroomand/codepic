<script lang="ts">
  import { X } from '@lucide/svelte';
  import { Dialog } from 'bits-ui';
  import type { Snippet } from 'svelte';

  type Props = {
    open?: boolean;
    title: string;
    description?: string;
    sheet?: boolean;
    trigger?: Snippet;
    triggerLabel?: string;
    children: Snippet;
  };
  let {
    open = $bindable(false),
    title,
    description,
    sheet = false,
    trigger,
    triggerLabel,
    children,
  }: Props = $props();
</script>

<Dialog.Root bind:open>
  {#if trigger}<Dialog.Trigger
      class="dialog-trigger"
      aria-label={triggerLabel}>{@render trigger()}</Dialog.Trigger
    >{/if}
  <Dialog.Portal>
    <Dialog.Overlay class="ui-overlay" />
    <Dialog.Content class={sheet ? 'ui-dialog ui-sheet' : 'ui-dialog'}>
      <div class="ui-dialog-header">
        <div>
          <Dialog.Title class="ui-dialog-title">{title}</Dialog.Title
          >{#if description}<Dialog.Description class="ui-dialog-description"
              >{description}</Dialog.Description
            >{/if}
        </div>
        <Dialog.Close
          class="ui-icon-button"
          aria-label="Close {title}"><X size={18} /></Dialog.Close
        >
      </div>
      <div class="ui-dialog-body">{@render children()}</div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.dialog-trigger) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 11px;
    border: 1px solid var(--border-base);
    border-radius: 8px;
    background: transparent;
    color: var(--text-base);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  :global(.dialog-trigger:hover) {
    background: var(--surface-active);
    color: var(--text-strong);
  }
</style>
