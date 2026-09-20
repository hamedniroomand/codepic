<script lang="ts">
  type Props = {
    code: string;
    wrap: boolean;
    onscroll: (offset: { left: number; top: number }) => void;
  };
  let { code = $bindable(), wrap, onscroll }: Props = $props();
</script>

<!-- Transparent textarea over the highlighted lines. It owns caret and selection. -->
<textarea
  class="input"
  class:wrap
  aria-label="Code"
  spellcheck="false"
  autocomplete="off"
  autocapitalize="off"
  wrap={wrap ? 'soft' : 'off'}
  bind:value={code}
  onscroll={(event) =>
    onscroll({ left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop })}
></textarea>

<style>
  .input {
    position: absolute;
    top: 0;
    left: var(--gutter);
    width: calc(100% - var(--gutter));
    height: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    resize: none;
    background: transparent;
    color: transparent;
    caret-color: var(--win-title);
    font: inherit;
    letter-spacing: inherit;
    tab-size: inherit;
    white-space: pre;
    overflow: auto;
  }
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  /* The window draws the focus ring instead, because this element is invisible. */
  .input:focus-visible {
    outline: none;
  }
  .input::selection {
    background: #7aa8ff40;
    color: transparent;
  }
</style>
