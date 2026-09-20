<script lang="ts">
  type Props = { css: string; label: string; selected: boolean; onclick: () => void };
  let { css, label, selected, onclick }: Props = $props();
</script>

<button
  type="button"
  class="swatch"
  style:background={css}
  aria-label={label}
  title={label}
  aria-pressed={selected}
  {onclick}
></button>

<style>
  .swatch {
    position: relative;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 1px solid var(--border-subtle);
    border-radius: 50%;
    cursor: pointer;
  }
  .swatch[aria-pressed='true']::after {
    content: '';
    position: absolute;
    inset: -4px;
    border: 1px solid var(--accent);
    border-radius: inherit;
  }
</style>
