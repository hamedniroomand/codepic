<script lang="ts">
  import type { AppearanceConfig } from '$lib/appearance-config';
  import { backgroundStyle } from '$lib/backgrounds';

  import CodeWindow from './CodeWindow.svelte';

  type Props = {
    appearance: AppearanceConfig;
    lines: string[];
    interactive?: boolean;
    forExport?: boolean;
    frameRef?: (element: HTMLDivElement | null) => void;
    code?: string;
    onTitleChange?: (title: string) => void;
  };

  let {
    appearance,
    lines,
    interactive = false,
    forExport = false,
    frameRef = () => {},
    code = $bindable(''),
    onTitleChange = () => {},
  }: Props = $props();

  let element = $state<HTMLDivElement | null>(null);
  let transparent = $derived(appearance.background.mode === 'transparent');
  let background = $derived(
    Object.entries(backgroundStyle(appearance.background))
      .map(([key, value]) => `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${value}`)
      .join(';'),
  );

  $effect(() => {
    frameRef(element);
    return (): void => frameRef(null);
  });
</script>

<div
  bind:this={element}
  class="frame"
  class:checker={transparent && !forExport}
  class:offscreen={forExport}
  aria-hidden={forExport ? true : undefined}
  inert={forExport}
  style="padding: {appearance.paddingPx}px; width: {appearance.width}px; {background}"
>
  <CodeWindow
    {appearance}
    {lines}
    {interactive}
    bind:code
    {onTitleChange}
  />
</div>

<style>
  .frame {
    box-sizing: border-box;
    flex: none;
  }
  /* Transparent exports need a visible checkerboard on screen only. */
  .checker {
    background-color: #ddd !important;
    background-image: conic-gradient(#eee 25%, #ddd 0 50%, #eee 0 75%, #ddd 0) !important;
    background-size: 16px 16px;
  }
  .offscreen {
    position: fixed;
    top: 0;
    left: -10000px;
    pointer-events: none;
  }
</style>
