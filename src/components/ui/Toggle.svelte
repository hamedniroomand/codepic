<script lang="ts">
  type Props = { label: string; checked: boolean; onchange: (checked: boolean) => void };
  let { label, checked, onchange }: Props = $props();
</script>

<label class="toggle">
  <span class="label">{label}</span>
  <input
    type="checkbox"
    {checked}
    onchange={(event) => onchange(event.currentTarget.checked)}
  />
  <span
    class="switch"
    aria-hidden="true"
  ></span>
</label>

<style>
  .toggle {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    white-space: nowrap;
    cursor: pointer;
  }
  .label {
    color: var(--text-muted);
    font-size: var(--text-label);
  }
  input {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 32px;
    height: var(--control-height);
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }
  .switch {
    position: relative;
    display: block;
    width: 32px;
    height: 18px;
    margin: 7px 0;
    border-radius: var(--radius-full);
    background: var(--border-strong);
    pointer-events: none;
  }
  .switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--text-strong);
    transition: transform 120ms ease;
  }
  input:checked + .switch {
    background: var(--accent);
  }
  input:checked + .switch::after {
    transform: translateX(14px);
    background: var(--surface-base);
  }
  input:focus-visible + .switch {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: reduce) {
    .switch::after {
      transition: none;
    }
  }
</style>
