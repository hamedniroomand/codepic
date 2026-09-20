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
</script>

<input
  type="number"
  {value}
  {min}
  {max}
  {step}
  aria-labelledby={labelledby}
  onchange={(event) => {
    const next = event.currentTarget.valueAsNumber;
    if (Number.isFinite(next)) onchange(next);
    else event.currentTarget.value = String(value);
  }}
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
