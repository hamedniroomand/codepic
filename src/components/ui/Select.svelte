<script lang="ts">
  type Option = { value: string; label: string };
  type Props = {
    value: string;
    options: readonly Option[];
    label?: string;
    labelledby?: string;
    onchange: (value: string) => void;
  };

  let { value, options, label, labelledby, onchange }: Props = $props();
</script>

<select
  {value}
  aria-label={label}
  aria-labelledby={labelledby}
  onchange={(event) => onchange(event.currentTarget.value)}
>
  {#each options as option (option.value)}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>

<style>
  select {
    height: var(--control-height);
    max-width: 100%;
    box-sizing: border-box;
    padding: 0 var(--space-xs);
    border: 1px solid var(--border-base);
    border-radius: var(--radius-sm);
    background: var(--surface-well);
    color: var(--text-base);
    font-size: var(--text-label);
    cursor: pointer;
  }
  select:hover {
    border-color: var(--border-strong);
    color: var(--text-strong);
  }
</style>
