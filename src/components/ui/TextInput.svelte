<script lang="ts">
  type Props = {
    value: string;
    placeholder?: string;
    labelledby?: string;
    onchange: (value: string) => void;
  };

  let { value, placeholder = '', labelledby, onchange }: Props = $props();
</script>

<input
  type="text"
  {value}
  {placeholder}
  spellcheck="false"
  aria-labelledby={labelledby}
  onchange={(event) => onchange(event.currentTarget.value)}
/>

<style>
  input {
    height: var(--control-height);
    width: 100%;
    box-sizing: border-box;
    padding: 0 var(--space-xs);
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
