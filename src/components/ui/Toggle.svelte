<script lang="ts">
  import { Label, Switch } from 'bits-ui';
  type Props = { label: string; checked: boolean; onchange: (checked: boolean) => void };
  let { label, checked, onchange }: Props = $props();
  const id = $props.id();
</script>

<div class="toggle">
  <Label.Root
    for={id}
    class="toggle-label">{label}</Label.Root
  ><Switch.Root
    {id}
    {checked}
    onCheckedChange={onchange}
    class="switch"><Switch.Thumb class="thumb" /></Switch.Root
  >
</div>

<style>
  .toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 30px;
  }
  .toggle :global(.toggle-label) {
    color: var(--text-base);
    font-size: 13px;
    cursor: pointer;
  }
  .toggle :global(.switch) {
    display: inline-flex;
    align-items: center;
    width: 34px;
    height: 20px;
    padding: 3px;
    border: 0;
    border-radius: 999px;
    background: var(--border-strong);
    cursor: pointer;
    flex-shrink: 0;
  }
  .toggle :global(.switch[data-state='checked']) {
    background: var(--accent);
  }
  .toggle :global(.thumb) {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: white;
    transition: transform 120ms ease;
    box-shadow: 0 1px 2px #0a090830;
  }
  .toggle :global(.thumb[data-state='checked']) {
    background: var(--on-accent);
    transform: translateX(14px);
  }
</style>
