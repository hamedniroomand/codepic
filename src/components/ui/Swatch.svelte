<script lang="ts">
  import { Check } from '@lucide/svelte';
  import { RadioGroup, Tooltip } from 'bits-ui';

  let { css, label, value }: { css: string; label: string; value: string } = $props();
</script>

<Tooltip.Root>
  <Tooltip.Trigger
    >{#snippet child({ props })}<RadioGroup.Item
        {...props}
        {value}
        class="swatch"
        style={`background: ${css}`}
        aria-label={label}
        >{#snippet children({ checked })}{#if checked}<Check
              size={12}
              strokeWidth={2.5}
            />{/if}{/snippet}</RadioGroup.Item
      >{/snippet}</Tooltip.Trigger
  >
  <Tooltip.Portal
    ><Tooltip.Content
      class="ui-tooltip"
      sideOffset={7}>{label}</Tooltip.Content
    ></Tooltip.Portal
  >
</Tooltip.Root>

<style>
  :global(.swatch) {
    display: grid;
    place-items: center;
    position: relative;
    width: 100%;
    min-width: 22px;
    height: 30px;
    padding: 0;
    border: 1px solid #ffffff20;
    border-radius: 7px;
    cursor: pointer;
    color: white;
  }
  :global(.swatch svg) {
    background: color-mix(in srgb, var(--surface-well) 56%, transparent);
    padding: 2px;
    border-radius: 50%;
    box-sizing: content-box;
  }
  :global(.swatch[data-state='checked']) {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>
