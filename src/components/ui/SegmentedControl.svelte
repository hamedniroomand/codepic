<script lang="ts">
  type Option = { value: string; label: string };
  type Props = {
    value: string;
    options: readonly Option[];
    labelledby?: string;
    onchange: (value: string) => void;
  };

  let { value, options, labelledby, onchange }: Props = $props();
</script>

<div
  class="segments"
  role="group"
  aria-labelledby={labelledby}
>
  {#each options as option (option.value)}
    <button
      type="button"
      aria-pressed={value === option.value}
      onclick={() => onchange(option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .segments {
    display: flex;
    gap: 2px;
    padding: 2px;
    border-radius: var(--radius-sm);
    background: var(--surface-well);
  }
  button {
    height: 28px;
    min-width: 30px;
    padding: 0 var(--space-xs);
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    font-size: var(--text-label);
    cursor: pointer;
  }
  button:hover {
    color: var(--text-strong);
  }
  button[aria-pressed='true'] {
    background: var(--surface-active);
    color: var(--text-strong);
  }
</style>
