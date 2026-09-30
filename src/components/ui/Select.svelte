<script lang="ts">
  import { Check, ChevronDown } from '@lucide/svelte';
  import { Select } from 'bits-ui';
  type Option = { value: string; label: string; colors?: readonly string[] };
  type Props = {
    value: string;
    options: readonly Option[];
    label?: string;
    labelledby?: string;
    onchange: (value: string) => void;
  };
  let { value, options, label, labelledby, onchange }: Props = $props();
  const selectedOption = $derived(options.find((option) => option.value === value));
</script>

<Select.Root
  type="single"
  {value}
  onValueChange={onchange}
  allowDeselect={false}
>
  <Select.Trigger
    class="ui-control"
    aria-label={label}
    aria-labelledby={labelledby}
  >
    <span>{selectedOption?.label ?? value}</span><ChevronDown
      size={15}
      strokeWidth={1.6}
    />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content
      class="ui-menu"
      sideOffset={6}
      align="start"
    >
      <Select.Viewport>
        {#each options as option (option.value)}
          <Select.Item
            class="ui-option"
            value={option.value}
            label={option.label}
          >
            {#snippet children({ selected })}
              {#if option.colors}<span
                  class="palette"
                  aria-hidden="true"
                  >{#each option.colors as color (color)}<i style:background={color}
                    ></i>{/each}</span
                >{/if}
              <span>{option.label}</span>{#if selected}<Check
                  class="selected-icon"
                  size={14}
                />{/if}
            {/snippet}
          </Select.Item>
        {/each}
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>

<style>
  .palette {
    display: flex;
    gap: 2px;
  }
  .palette i {
    width: 5px;
    height: 14px;
    border-radius: 2px;
  }
</style>
