<script lang="ts">
  import Field from '$components/ui/Field.svelte';
  import SegmentedControl from '$components/ui/SegmentedControl.svelte';
  import Select from '$components/ui/Select.svelte';
  import Toggle from '$components/ui/Toggle.svelte';
  import type { AppearanceConfig, PaddingPx } from '$lib/config/appearance-config';
  import { PADDING_OPTIONS } from '$lib/config/appearance-config';
  import { LANGUAGES } from '$lib/config/languages';
  import { THEMES, isDarkTheme, toggleDarkTheme } from '$lib/config/themes';
  import type { LineMarks } from '$lib/marks/line-marks';

  import AdvancedPopover from './AdvancedPopover.svelte';
  import BackgroundSwatches from './BackgroundSwatches.svelte';
  import PresetsPopover from './PresetsPopover.svelte';

  type Props = {
    appearance: AppearanceConfig;
    marks: LineMarks;
    languageDetected: boolean;
    onChange: (patch: Partial<AppearanceConfig>) => void;
    onMarksChange: (marks: LineMarks) => void;
    onStatus: (message: string) => void;
  };
  let { appearance, marks, languageDetected, onChange, onMarksChange, onStatus }: Props = $props();

  const themeOptions = THEMES.map((theme) => ({ value: theme.id, label: theme.label }));
  const languageOptions = LANGUAGES.map((language) => ({
    value: language.id,
    label: language.label,
  }));
  const paddingOptions = PADDING_OPTIONS.map((px) => ({ value: String(px), label: String(px) }));
</script>

<section
  class="dock"
  aria-label="Image settings"
>
  <BackgroundSwatches
    {appearance}
    {onChange}
  />

  <span
    class="divider"
    aria-hidden="true"
  ></span>

  <Field label="Theme">
    {#snippet children(labelId)}
      <Select
        value={appearance.themeId}
        options={themeOptions}
        labelledby={labelId}
        onchange={(themeId) => onChange({ themeId })}
      />
    {/snippet}
  </Field>

  <Field label="Padding">
    {#snippet children(labelId)}
      <SegmentedControl
        value={String(appearance.paddingPx)}
        options={paddingOptions}
        labelledby={labelId}
        onchange={(value) => onChange({ paddingPx: Number(value) as PaddingPx })}
      />
    {/snippet}
  </Field>

  <Field label={languageDetected ? 'Language · detected' : 'Language'}>
    {#snippet children(labelId)}
      <Select
        value={appearance.language}
        options={languageOptions}
        labelledby={labelId}
        onchange={(language) => onChange({ language })}
      />
    {/snippet}
  </Field>

  <Toggle
    label="Dark"
    checked={isDarkTheme(appearance.themeId)}
    onchange={() => onChange({ themeId: toggleDarkTheme(appearance.themeId) })}
  />

  <span
    class="divider"
    aria-hidden="true"
  ></span>

  <PresetsPopover
    {appearance}
    onApply={onChange}
    {onStatus}
  />

  <AdvancedPopover
    {appearance}
    {marks}
    {onChange}
    {onMarksChange}
  />
</section>

<style>
  .dock {
    display: flex;
    align-items: end;
    gap: var(--space-sm);
    width: max-content;
    max-width: calc(100vw - var(--space-md));
    margin: 0 auto;
    padding: var(--space-sm) var(--space-sm);
    border: 1px solid var(--border-base);
    border-radius: var(--radius-lg);
    background: var(--surface-raised);
    box-shadow: var(--shadow-dock);
  }
  .divider {
    align-self: stretch;
    width: 1px;
    background: var(--border-subtle);
  }
  @media (max-width: 860px) {
    .dock {
      flex-wrap: wrap;
      justify-content: center;
      width: calc(100% - var(--space-md));
      gap: var(--space-sm) var(--space-lg);
    }
    .divider {
      display: none;
    }
  }
</style>
