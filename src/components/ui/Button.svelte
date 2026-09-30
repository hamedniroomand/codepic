<script lang="ts">
  import { Button as ButtonPrimitive, Tooltip } from 'bits-ui';
  import type { Snippet } from 'svelte';

  type Props = {
    type?: 'button' | 'submit';
    variant?: 'primary' | 'ghost' | 'subtle';
    label?: string;
    title?: string;
    disabled?: boolean;
    busy?: boolean;
    onclick?: () => void;
    children: Snippet;
  };

  let {
    type = 'button',
    variant = 'ghost',
    label,
    title,
    disabled,
    busy,
    onclick,
    children,
  }: Props = $props();
</script>

<Tooltip.Root disabled={!title && !label}>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <ButtonPrimitive.Root
        {...props}
        {type}
        class="ui-button {variant}"
        aria-label={label}
        aria-busy={busy || undefined}
        {disabled}
        {onclick}
      >
        {@render children()}
      </ButtonPrimitive.Root>
    {/snippet}
  </Tooltip.Trigger>
  {#if title || label}<Tooltip.Portal
      ><Tooltip.Content
        class="ui-tooltip"
        sideOffset={7}>{title ?? label}</Tooltip.Content
      ></Tooltip.Portal
    >{/if}
</Tooltip.Root>

<style>
  :global(.ui-button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--control-height-lg);
    padding: 0 13px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 550;
    white-space: nowrap;
    cursor: pointer;
    transition: background 120ms;
  }
  :global(.ui-button.ghost) {
    border-color: var(--border-base);
    background: transparent;
    color: var(--text-base);
  }
  :global(.ui-button.subtle) {
    background: transparent;
    color: var(--text-muted);
  }
  :global(.ui-button.ghost:hover:not(:disabled)),
  :global(.ui-button.subtle:hover:not(:disabled)) {
    background: var(--surface-active);
    color: var(--text-strong);
  }
  :global(.ui-button.primary) {
    background: var(--accent);
    color: var(--on-accent);
    box-shadow: 0 2px 8px var(--accent-surface);
  }
  :global(.ui-button.primary:hover:not(:disabled)) {
    background: #93c5fd;
  }
  :global(.ui-button:disabled) {
    opacity: 0.5;
  }
</style>
