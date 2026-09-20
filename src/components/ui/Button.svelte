<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    variant?: 'primary' | 'ghost';
    label?: string;
    title?: string;
    disabled?: boolean;
    popovertarget?: string;
    onclick?: () => void;
    children: Snippet;
  };

  let {
    variant = 'ghost',
    label,
    title,
    disabled,
    popovertarget,
    onclick,
    children,
  }: Props = $props();
</script>

<button
  type="button"
  class={variant}
  aria-label={label}
  title={title ?? label}
  {disabled}
  {popovertarget}
  {onclick}
>
  {@render children()}
</button>

<style>
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    min-height: var(--control-height-lg);
    padding: 0 var(--space-sm);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font-size: var(--text-label);
    font-weight: var(--weight-label);
    white-space: nowrap;
    cursor: pointer;
  }
  .ghost {
    border-color: var(--border-base);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-strong);
  }
  .ghost:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--text-strong);
  }
  /* One accent action at a time. This is the export button. */
  .primary {
    background: var(--accent-surface);
    color: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent-ring);
  }
  .primary:hover:not(:disabled) {
    background: var(--accent-surface-hover);
  }
  button:disabled {
    opacity: 0.55;
  }
</style>
