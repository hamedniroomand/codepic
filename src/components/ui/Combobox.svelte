<script lang="ts">
  import { Check, ChevronsUpDown } from '@lucide/svelte';
  import { Combobox } from 'bits-ui';
  type Props = {
    value: string;
    options: readonly { value: string; label: string }[];
    label?: string;
    labelledby?: string;
    onchange: (value: string) => void;
  };
  let { value, options, label, labelledby, onchange }: Props = $props();
  let query = $state('');
  let open = $state(false);
  const selectedLabel = $derived(options.find((option) => option.value === value)?.label ?? value);
  const filtered = $derived(
    options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
  );
</script>

<Combobox.Root
  type="single"
  {value}
  onValueChange={onchange}
  bind:open
  inputValue={open ? query : selectedLabel}
  allowDeselect={false}
  onOpenChange={(next) => {
    if (!next) query = '';
  }}
>
  <div class="input-wrap">
    <Combobox.Input
      class="ui-control"
      aria-label={label}
      aria-labelledby={labelledby}
      placeholder="Search languages…"
      oninput={(event) => (query = event.currentTarget.value)}
    />
    <Combobox.Trigger
      class="chevron"
      aria-label="Show languages"><ChevronsUpDown size={15} /></Combobox.Trigger
    >
  </div>
  <Combobox.Portal>
    <Combobox.Content
      class="ui-menu"
      sideOffset={6}
      align="start"
    >
      <Combobox.Viewport>
        {#each filtered as option (option.value)}
          <Combobox.Item
            class="ui-option"
            value={option.value}
            label={option.label}
          >
            {#snippet children({ selected })}<span>{option.label}</span>{#if selected}<Check
                  class="selected-icon"
                  size={14}
                />{/if}{/snippet}
          </Combobox.Item>
        {:else}<div class="ui-empty">No languages found.</div>{/each}
      </Combobox.Viewport>
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>

<style>
  .input-wrap {
    position: relative;
  }
  .input-wrap :global(input) {
    padding-right: 38px;
    cursor: text;
  }
  .input-wrap :global(.chevron) {
    position: absolute;
    top: 1px;
    right: 1px;
    display: grid;
    place-items: center;
    height: calc(var(--control-height) - 2px);
    width: 34px;
    border: 0;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 6px;
  }
</style>
