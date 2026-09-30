<script lang="ts">
  import { Palette, Code2, Scan, Download, SlidersHorizontal } from '@lucide/svelte';

  import Field from '$components/ui/Field.svelte';
  import Select from '$components/ui/Select.svelte';
  import Toggle from '$components/ui/Toggle.svelte';
  import type { AppearanceConfig } from '$lib/config/appearance-config';
  import { THEMES, isDarkTheme, toggleDarkTheme } from '$lib/config/themes';
  import type { LineMarks } from '$lib/marks/line-marks';
  import type { PresetStore } from '$lib/presets/presets.svelte';

  import BackgroundSwatches from './BackgroundSwatches.svelte';
  import CodeFields from './CodeFields.svelte';
  import ExportFields from './ExportFields.svelte';
  import LayoutFields from './LayoutFields.svelte';
  import PresetsPopover from './PresetsPopover.svelte';

  type Props = {
    appearance: AppearanceConfig;
    marks: LineMarks;
    languageDetected: boolean;
    store: PresetStore;
    onChange: (patch: Partial<AppearanceConfig>) => void;
    onMarksChange: (marks: LineMarks) => void;
    onStatus: (message: string) => void;
  };
  let { appearance, marks, languageDetected, store, onChange, onMarksChange, onStatus }: Props =
    $props();
  const palettes: Record<string, string[]> = {
    'github-light': ['#cf222e', '#0550ae', '#116329'],
    'github-dark': ['#ff7b72', '#79c0ff', '#a5d6ff'],
    dracula: ['#ff79c6', '#bd93f9', '#50fa7b'],
    nord: ['#81a1c1', '#88c0d0', '#a3be8c'],
    'one-dark-pro': ['#e06c75', '#c678dd', '#98c379'],
  };
  const themes = THEMES.map((theme) => ({
    value: theme.id,
    label: theme.label,
    colors: palettes[theme.id],
  }));
</script>

<section
  class="inspector"
  id="codepic-inspector"
  aria-label="Image settings"
>
  <div class="inspector-heading">
    <span><SlidersHorizontal size={16} /> Image settings</span><PresetsPopover
      {appearance}
      {store}
      onApply={onChange}
      {onStatus}
    />
  </div>
  <section class="settings-section">
    <h2><Palette size={15} /> Appearance</h2>
    <Field label="Background"
      >{#snippet children()}<BackgroundSwatches
          {appearance}
          {onChange}
        />{/snippet}</Field
    >
    <Field label="Theme"
      >{#snippet children(labelId)}<Select
          value={appearance.themeId}
          options={themes}
          labelledby={labelId}
          onchange={(themeId) => onChange({ themeId })}
        />{/snippet}</Field
    >
    <Toggle
      label="Dark theme"
      checked={isDarkTheme(appearance.themeId)}
      onchange={() => onChange({ themeId: toggleDarkTheme(appearance.themeId) })}
    />
  </section>
  <section class="settings-section">
    <h2><Code2 size={15} /> Code</h2>
    <CodeFields
      {appearance}
      {languageDetected}
      {onChange}
    />
  </section>
  <section class="settings-section">
    <h2><Scan size={15} /> Layout</h2>
    <LayoutFields
      {appearance}
      {marks}
      {onChange}
      {onMarksChange}
    />
  </section>
  <section class="settings-section">
    <h2><Download size={15} /> Export</h2>
    <ExportFields
      {appearance}
      {onChange}
    />
  </section>
</section>

<style>
  .inspector {
    width: 100%;
  }
  .inspector-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 20px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .inspector-heading > span {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-strong);
  }
  .inspector-heading > span :global(svg) {
    color: var(--text-muted);
  }
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 21px 20px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .settings-section:last-child {
    border-bottom: 0;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 2px;
    color: var(--text-strong);
    font-size: 13px;
    font-weight: 550;
  }
  h2 :global(svg) {
    color: var(--text-muted);
    stroke-width: 1.6;
  }
  @media (max-width: 959px) {
    .inspector-heading > span {
      display: none;
    }
    .inspector-heading {
      padding: 12px 20px;
      justify-content: flex-end;
    }
  }
</style>
