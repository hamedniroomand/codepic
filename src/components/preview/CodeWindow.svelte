<script lang="ts">
  import type { AppearanceConfig } from '$lib/config/appearance-config';
  import { DEFAULT_APPEARANCE } from '$lib/config/appearance-config';
  import { themeById } from '$lib/config/themes';
  import {
    NO_MARKS,
    cycleMark,
    hasDiffMarks,
    isDimmed,
    markAt,
    type LineMarks,
    type MarkKind,
  } from '$lib/marks/line-marks';

  import CodeEditorOverlay from './CodeEditorOverlay.svelte';

  type Props = {
    appearance: AppearanceConfig;
    lines: string[];
    marks?: LineMarks;
    interactive?: boolean;
    code?: string;
    onTitleChange?: (title: string) => void;
    onMarksChange?: (marks: LineMarks) => void;
  };

  let {
    appearance,
    lines,
    marks = NO_MARKS,
    interactive = false,
    code = $bindable(''),
    onTitleChange = () => {},
    onMarksChange,
  }: Props = $props();

  const DIFF_SIGNS: Record<MarkKind, string> = { emphasized: '', added: '+', removed: '−' };

  let scroll = $state({ left: 0, top: 0 });
  let theme = $derived(themeById(appearance.themeId));
  let showTitleBar = $derived(appearance.showTitle || appearance.windowStyle === 'controls');
  let showDiff = $derived(hasDiffMarks(marks));
  let gutterWidth = $derived((appearance.lineNumbers ? 4 : 0) + (showDiff ? 2 : 0));

  // The untouched default reads as a placeholder, so clear it on focus and put
  // it back if the user leaves without typing. A name they chose is never touched.
  function clearPlaceholderTitle(): void {
    if (appearance.title === DEFAULT_APPEARANCE.title) onTitleChange('');
  }

  function restorePlaceholderTitle(): void {
    if (!appearance.title.trim()) onTitleChange(DEFAULT_APPEARANCE.title);
  }
</script>

<!--
  Theme colors stay inline on this element. The export clones this subtree out of
  the document, where :root custom properties no longer reach it.
-->
<div
  class="window"
  class:borderless={appearance.windowStyle === 'borderless'}
  style="
    --win-bg: {theme.window.bg};
    --win-border: {theme.window.border};
    --win-title: {theme.window.title};
    --win-muted: {theme.window.muted};
    --fs: {appearance.fontSize}px;
    --lh: {appearance.lineHeight};
    --gutter: {gutterWidth}ch"
>
  {#if showTitleBar}
    <div class="title-bar">
      {#if appearance.windowStyle === 'controls'}
        <div
          class="traffic"
          aria-hidden="true"
        >
          <span></span><span></span><span></span>
        </div>
      {/if}
      {#if appearance.showTitle}
        {#if interactive}
          <input
            class="title"
            aria-label="Filename"
            spellcheck="false"
            value={appearance.title}
            oninput={(event) => onTitleChange(event.currentTarget.value)}
            onfocus={clearPlaceholderTitle}
            onblur={restorePlaceholderTitle}
          />
        {:else}
          <span class="title">{appearance.title || ' '}</span>
        {/if}
      {/if}
    </div>
  {/if}

  <div
    class="editor"
    class:wrap={appearance.wrap}
  >
    <div
      class="lines"
      aria-hidden={interactive ? true : undefined}
    >
      {#each lines as line, index (index)}
        {@const number = index + 1}
        {@const mark = markAt(number, marks)}
        <div
          class="row"
          class:dimmed={isDimmed(number, marks)}
          data-mark={mark}
        >
          {#if gutterWidth}
            <span class="gutter">
              {#if showDiff}<span class="sign">{mark ? DIFF_SIGNS[mark] : ''}</span>{/if}
              {#if appearance.lineNumbers}
                {#if interactive && onMarksChange}
                  <button
                    type="button"
                    class="number"
                    tabindex="-1"
                    title="Click to highlight, then mark as added or removed"
                    onclick={() => onMarksChange(cycleMark(marks, number))}>{number}</button
                  >
                {:else}
                  <span class="number">{number}</span>
                {/if}
              {/if}
            </span>
          {/if}
          <span class="clip">
            <span
              class="code"
              style:transform={interactive
                ? `translate(${-scroll.left}px, ${-scroll.top}px)`
                : undefined}>{@html line || ' '}</span
            >
          </span>
        </div>
      {/each}
    </div>

    {#if interactive}
      <CodeEditorOverlay
        bind:code
        wrap={appearance.wrap}
        onscroll={(offset) => (scroll = offset)}
      />
    {/if}
  </div>
</div>

<style>
  .window {
    --diff-added: #3fb950;
    --diff-removed: #f85149;
    overflow: hidden;
    border: 1px solid var(--win-border);
    border-radius: 18px;
    background: var(--win-bg);
    color: var(--win-title);
    box-shadow:
      #ffffff4d 0 0 0 1px,
      #000000cc 0 0 0 1.5px,
      #00000009 0 2.8px 2.2px 0,
      #0000000c 0 6.7px 5.3px 0,
      #0000000f 0 12.5px 10px 0,
      #00000012 0 22.3px 17.9px 0,
      #00000016 0 41.8px 33.4px 0,
      #0000001f 0 100px 80px 0;
    font:
      var(--fs) / var(--lh) 'JetBrains Mono',
      monospace;
  }
  .window.borderless {
    border-color: transparent;
    box-shadow: none;
  }
  .title-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 54px;
    padding: 0 80px;
  }
  .traffic {
    position: absolute;
    left: 20px;
    display: flex;
    gap: 7px;
  }
  .traffic span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ffffff30;
  }
  .title {
    display: block;
    width: 100%;
    min-width: 0;
    padding: 3px 0;
    border: 0;
    background: transparent;
    color: var(--win-title);
    font:
      12px / 18px 'JetBrains Mono',
      monospace;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  /* No ring on the filename. The caret already shows it is editable. */
  .title:focus-visible {
    outline: none;
  }
  .editor {
    position: relative;
    margin: 8px 24px 24px;
    tab-size: 2;
  }
  .lines {
    min-height: 1lh;
  }
  .row {
    display: flex;
    align-items: start;
    min-height: 1lh;
  }
  .gutter {
    display: flex;
    flex: 0 0 var(--gutter);
    color: var(--win-muted);
    user-select: none;
  }
  .sign {
    flex: 0 0 2ch;
    text-align: center;
  }
  .number {
    flex: 1;
    box-sizing: border-box;
    padding: 0 1.5ch 0 0;
    text-align: right;
  }
  button.number {
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  button.number:hover {
    color: var(--win-title);
  }
  .row[data-mark] {
    margin: 0 -8px;
    padding: 0 8px;
    background: var(--mark-tint);
  }
  .row[data-mark='emphasized'] {
    --mark-tint: color-mix(in srgb, var(--win-title) 14%, transparent);
  }
  .row[data-mark='added'] {
    --mark-tint: color-mix(in srgb, var(--diff-added) 20%, transparent);
    --mark-sign: var(--diff-added);
  }
  .row[data-mark='removed'] {
    --mark-tint: color-mix(in srgb, var(--diff-removed) 20%, transparent);
    --mark-sign: var(--diff-removed);
  }
  .row .sign {
    color: var(--mark-sign, inherit);
  }
  .row.dimmed {
    opacity: 0.4;
  }
  .clip {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
  .code {
    display: block;
    white-space: pre;
  }
  .wrap .code {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .window:has(:global(textarea:focus-visible)) {
    outline: 2px solid var(--win-border);
    outline-offset: 3px;
  }
</style>
