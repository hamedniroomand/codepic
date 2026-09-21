<script lang="ts">
  import type { AppearanceConfig } from '$lib/appearance-config';
  import { clampWidth } from '$lib/appearance-config';

  import ResizeHandle from './ResizeHandle.svelte';
  import SnapshotFrame from './SnapshotFrame.svelte';

  type Props = {
    appearance: AppearanceConfig;
    lines: string[];
    code: string;
    exportRef: (element: HTMLDivElement | null) => void;
    onChange: (patch: Partial<AppearanceConfig>) => void;
  };

  let { appearance, lines, code = $bindable(), exportRef, onChange }: Props = $props();

  const SIDE_GUTTER = 64;

  let stageWidth = $state(800);

  // The hint has done its job once the code differs from what loaded. It stays
  // hidden for the rest of the session and is never persisted.
  const initialCode = code;
  let edited = $state(false);
  $effect(() => {
    if (code !== initialCode) edited = true;
  });

  // Width only. Content height must not change how wide the card looks,
  // so more code lines make the stage taller and never narrower.
  let scale = $derived(Math.min(1, Math.max(1, stageWidth - SIDE_GUTTER) / appearance.width));
</script>

<div
  class="stage"
  bind:clientWidth={stageWidth}
>
  <div class="composition">
    <div class="viewport">
      <div style:zoom={scale}>
        <SnapshotFrame
          {appearance}
          {lines}
          interactive
          bind:code
          onTitleChange={(title) => onChange({ title })}
        />
      </div>
      {#each ['left', 'right'] as const as side (side)}
        <ResizeHandle
          {side}
          {scale}
          width={appearance.width}
          onResize={(width) => onChange({ width: clampWidth(width) })}
        />
      {/each}
    </div>
    <p class="caption">
      <span
        class="hint"
        class:edited>Click the code to edit</span
      >
      <span>{appearance.width} px <span class="separator">/</span> {Math.round(scale * 100)}%</span>
    </p>
  </div>

  <SnapshotFrame
    {appearance}
    {lines}
    forExport
    frameRef={exportRef}
  />
</div>

<style>
  .stage {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-md) 0;
  }
  .composition {
    flex: none;
  }
  .viewport {
    position: relative;
  }
  .caption {
    display: flex;
    justify-content: space-between;
    margin: var(--space-sm) 0 0;
    color: var(--text-muted);
    font-size: var(--text-label);
  }
  /* Hidden, not removed: the box stays so the width readout never shifts. */
  .hint {
    transition:
      opacity 150ms ease,
      visibility 0s linear 150ms;
  }
  .hint.edited {
    opacity: 0;
    visibility: hidden;
  }
  .separator {
    margin: 0 var(--space-xs);
    color: var(--border-strong);
  }
  @media (max-width: 640px) {
    .caption {
      font-size: var(--text-body-sm);
    }
  }
</style>
