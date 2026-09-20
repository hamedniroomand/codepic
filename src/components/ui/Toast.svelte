<script lang="ts">
  type Props = { message: string };
  let { message }: Props = $props();
</script>

<p
  class="toast"
  role="status"
>
  {message}
</p>

<style>
  .toast {
    position: fixed;
    bottom: var(--space-lg);
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
    margin: 0;
    padding: var(--space-sm) var(--space-sm);
    width: max-content;
    max-width: calc(100% - var(--space-xl));
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    color: var(--text-strong);
    font-size: var(--text-body-sm);
    box-shadow: var(--shadow-popover);
  }
</style>
