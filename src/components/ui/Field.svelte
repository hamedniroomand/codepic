<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = { label: string; children: Snippet<[string]> };
  let { label, children }: Props = $props();

  // Groups need aria-labelledby. A single control can use the same id.
  const labelId = $props.id();
</script>

<div class="field">
  <span
    class="label"
    id={labelId}>{label}</span
  >
  {@render children(labelId)}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 0;
  }
  .label {
    color: var(--text-muted);
    font-size: var(--text-label);
  }
</style>
