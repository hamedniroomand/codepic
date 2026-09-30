<script lang="ts">
  import { RadioGroup } from 'bits-ui';

  type Props = {
    value: string;
    options: readonly { value: string; label: string }[];
    labelledby?: string;
    onchange: (value: string) => void;
  };
  let { value, options, labelledby, onchange }: Props = $props();
</script>

<RadioGroup.Root
  {value}
  onValueChange={onchange}
  orientation="horizontal"
  class="segments"
  aria-labelledby={labelledby}
>
  {#each options as option (option.value)}<RadioGroup.Item
      class="segment"
      value={option.value}>{option.label}</RadioGroup.Item
    >{/each}
</RadioGroup.Root>

<style>
  :global(.segments) {
    display: flex;
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--border-base);
    border-radius: 8px;
    background: var(--surface-well);
  }
  :global(.segment) {
    height: 30px;
    flex: 1;
    min-width: 30px;
    padding: 0 4px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: var(--text-muted);
    font-size: 12px;
    cursor: pointer;
  }
  :global(.segment:hover) {
    color: var(--text-strong);
  }
  :global(.segment[data-state='checked']) {
    background: var(--border-base);
    box-shadow: 0 1px 3px #0a090840;
    color: var(--text-strong);
  }
</style>
