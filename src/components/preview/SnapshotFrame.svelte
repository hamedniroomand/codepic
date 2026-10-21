<script lang="ts">
  import {
    aspectHeight,
    fitScale,
    verticalPadding,
    type AppearanceConfig,
  } from '$lib/config/appearance-config';
  import { backgroundStyle, signatureColor } from '$lib/config/backgrounds';
  import { codeFontStack } from '$lib/config/fonts';
  import type { LineMarks } from '$lib/marks/line-marks';

  import CodeWindow from './CodeWindow.svelte';

  type Props = {
    appearance: AppearanceConfig;
    lines: string[];
    marks?: LineMarks;
    interactive?: boolean;
    forExport?: boolean;
    frameRef?: (element: HTMLDivElement | null) => void;
    code?: string;
    onTitleChange?: (title: string) => void;
    onMarksChange?: (marks: LineMarks) => void;
    /** Reports how much a fixed shape shrinks the card. 1 means no change. */
    onFit?: (scale: number) => void;
  };

  let {
    appearance,
    lines,
    marks,
    interactive = false,
    forExport = false,
    frameRef = () => {},
    code = $bindable(''),
    onTitleChange = () => {},
    onMarksChange,
    onFit = () => {},
  }: Props = $props();

  let cardHeight = $state(0);
  let fixedHeight = $derived(aspectHeight(appearance.aspect, appearance.width));
  let fit = $derived(
    fixedHeight === null ? 1 : fitScale(fixedHeight, appearance.paddingPx, cardHeight),
  );
  $effect(() => onFit(fit));

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
  class:fixed={fixedHeight !== null}
  aria-hidden={forExport ? true : undefined}
  inert={forExport}
  style="padding: {appearance.paddingPx}px; width: {appearance.width}px; {fixedHeight === null
    ? ''
    : `height: ${fixedHeight}px; padding-block: ${verticalPadding(fixedHeight, appearance.paddingPx)}px;`} {background}"
>
  <div
    class="card"
    bind:offsetHeight={cardHeight}
    style:transform={fit === 1 ? null : `scale(${fit})`}
  >
    <CodeWindow
      {appearance}
      {lines}
      {marks}
      {interactive}
      bind:code
      {onTitleChange}
      {onMarksChange}
    />
  </div>
  {#if appearance.signature}
    {@const [vertical, horizontal] = appearance.signaturePosition.split('-')}
    <span
      class="signature"
      style="{vertical}: {appearance.paddingPx /
        2}px; {horizontal}: {appearance.paddingPx}px; translate: 0 {vertical === 'top'
        ? '-50%'
        : '50%'}; color: {signatureColor(appearance.background)}; font-family: {codeFontStack(
        appearance.codeFont,
      )}">{appearance.signature}</span
    >
  {/if}
</div>

<style>
  .frame {
    position: relative;
    box-sizing: border-box;
    flex: none;
  }
  /* A fixed shape centres the card. A card that is too tall overflows evenly and is scaled back in. */
  .fixed {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }
  .card {
    flex: none;
  }
  /* Centred on the middle of the padding, in line with the window edge. */
  .signature {
    position: absolute;
    font-size: 12px;
    line-height: 1;
    white-space: pre;
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
