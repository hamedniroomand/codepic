<script lang="ts">
  import { SlidersHorizontal } from '@lucide/svelte';
  import type { Snippet } from 'svelte';

  import Dialog from '$components/ui/Dialog.svelte';

  let {
    mobile,
    open = $bindable(false),
    busy,
    children,
  }: { mobile: boolean; open?: boolean; busy: boolean; children: Snippet } = $props();
</script>

{#if mobile}
  <div
    class="mobile-settings"
    inert={busy}
  >
    <Dialog
      bind:open
      title="Image settings"
      description="Make the snapshot your own."
      sheet
    >
      {#snippet trigger()}<SlidersHorizontal size={17} /><span>Customize image</span>{/snippet}
      {@render children()}
    </Dialog>
  </div>
{:else}
  <aside
    class="settings-panel"
    inert={busy}
    aria-label="Customize image"
  >
    {@render children()}
  </aside>
{/if}

<style>
  .settings-panel {
    width: 320px;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--surface-raised);
    border-left: 1px solid var(--border-subtle);
  }
  .mobile-settings {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 30;
    display: flex;
    justify-content: center;
    padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
    background: color-mix(in srgb, var(--surface-base) 91%, transparent);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--border-base);
  }
  .mobile-settings :global(.dialog-trigger) {
    width: 100%;
    min-height: 44px;
    background: var(--surface-raised);
  }
</style>
