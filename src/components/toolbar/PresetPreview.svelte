<script lang="ts">
  import { Button } from 'bits-ui';

  import { backgroundStyle } from '$lib/config/backgrounds';
  import { themeById } from '$lib/config/themes';
  import type { Look } from '$lib/presets/presets';

  let { look, name, onApply }: { look: Look; name: string; onApply: () => void } = $props();
  const background = $derived(backgroundStyle(look.background));
  const theme = $derived(themeById(look.themeId));
</script>

<Button.Root
  type="button"
  class="preset"
  onclick={onApply}
  aria-label="Apply {name} preset"
>
  <span
    class="miniature"
    style:background-color={background.backgroundColor}
    style:background-image={background.backgroundImage}
    aria-hidden="true"
  >
    <span
      class="mini-window"
      style:background={theme.window.bg}
      style:border-color={theme.window.border}
    >
      <span class="dots"><i></i><i></i><i></i></span>
      <span class="code-lines"
        ><i style:background={theme.window.title}></i><i style:background={theme.window.muted}
        ></i><i style:background={theme.window.title}></i></span
      >
    </span>
  </span>
  <span class="name">{name}</span>
</Button.Root>

<style>
  :global(.preset) {
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--text-base);
    cursor: pointer;
    text-align: left;
    border-radius: 9px;
  }
  .miniature {
    display: grid;
    place-items: center;
    width: 100%;
    height: 94px;
    border-radius: 9px;
    border: 1px solid var(--border-base);
    box-sizing: border-box;
    transition: border-color 120ms;
  }
  :global(.preset:hover) .miniature {
    border-color: var(--accent);
  }
  .mini-window {
    display: block;
    width: 72%;
    padding: 9px;
    box-sizing: border-box;
    border: 1px solid;
    border-radius: 6px;
    box-shadow: 0 4px 10px #0a090830;
  }
  .dots {
    display: flex;
    gap: 3px;
    margin-bottom: 8px;
  }
  .dots i {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--text-muted) 40%, transparent);
  }
  .code-lines {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .code-lines i {
    height: 3px;
    width: 85%;
    border-radius: 1px;
    opacity: 0.7;
  }
  .code-lines i:nth-child(2) {
    width: 62%;
    margin-left: 6px;
  }
  .code-lines i:nth-child(3) {
    width: 44%;
  }
  .name {
    font-size: 12px;
    font-weight: 500;
  }
</style>
