<script lang="ts">
  import { Label } from 'bits-ui';
  import type { Snippet } from 'svelte';

  type Props = { label: string; children: Snippet<[string]> };
  let { label, children }: Props = $props();

  // Groups need aria-labelledby. A single control can use the same id.
  const labelId = $props.id();
</script>

<div class="field">
  <Label.Root
    class="label"
    id={labelId}>{label}</Label.Root
  >
  {@render children(labelId)}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
  }
  .field :global(.label) {
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 500;
  }
</style>
