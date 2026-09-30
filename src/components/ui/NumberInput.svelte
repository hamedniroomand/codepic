<script lang="ts">
  type Props = {
    value: number;
    min: number;
    max: number;
    step?: number;
    labelledby?: string;
    onchange: (value: number) => void;
  };

  let { value, min, max, step = 1, labelledby, onchange }: Props = $props();

  function commit(input: HTMLInputElement): void {
    const next = input.valueAsNumber;
    if (Number.isFinite(next)) {
      const accepted = Math.max(min, Math.min(max, next));
      onchange(accepted);
      input.value = String(accepted);
    } else input.value = String(value);
  }
</script>

<input
  type="number"
  {value}
  {min}
  {max}
  {step}
  aria-labelledby={labelledby}
  onchange={(event) => commit(event.currentTarget)}
  onblur={(event) => commit(event.currentTarget)}
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
