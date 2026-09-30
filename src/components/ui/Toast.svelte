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
    bottom: max(24px, env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    z-index: 110;
    margin: 0;
    padding: var(--space-sm) var(--space-sm);
    width: max-content;
    max-width: calc(100% - 48px);
    box-sizing: border-box;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    color: var(--text-strong);
    font-size: var(--text-body-sm);
    box-shadow: var(--shadow-popover);
  }
  @media (max-width: 959px) {
    .toast {
      bottom: calc(86px + env(safe-area-inset-bottom));
    }
  }
</style>
