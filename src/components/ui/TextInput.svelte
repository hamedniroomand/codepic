<script lang="ts">
  import { tick } from 'svelte';

  type Props = {
    value: string;
    placeholder?: string;
    labelledby?: string;
    label?: string;
    live?: boolean;
    onchange: (value: string) => void;
  };

  let { value, placeholder = '', labelledby, label, live = false, onchange }: Props = $props();
</script>

<input
  type="text"
  {value}
  {placeholder}
  spellcheck="false"
  aria-labelledby={labelledby}
  aria-label={label}
  oninput={(event) => {
    if (live) onchange(event.currentTarget.value);
  }}
  onchange={(event) => {
    if (!live) onchange(event.currentTarget.value);
  }}
  onblur={async (event) => {
    const input = event.currentTarget;
    if (!live && input.value !== value) onchange(input.value);
    await tick();
    input.value = value;
  }}
/>

<style>
  input {
    height: var(--control-height);
    width: 100%;
    box-sizing: border-box;
    padding: 0 11px;
    border: 1px solid var(--border-base);
    border-radius: var(--radius-sm);
    background: var(--surface-well);
    color: var(--text-base);
    font-size: var(--text-label);
  }
  input:hover {
    border-color: var(--border-strong);
  }
</style>
