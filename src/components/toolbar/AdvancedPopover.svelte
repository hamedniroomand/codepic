<script lang="ts">
  import Field from '$components/ui/Field.svelte';
  import NumberInput from '$components/ui/NumberInput.svelte';
  import Popover from '$components/ui/Popover.svelte';
  import Select from '$components/ui/Select.svelte';
  import Toggle from '$components/ui/Toggle.svelte';
  import type {
    AppearanceConfig,
    ExportFormat,
    ExportScale,
    WindowStyle,
  } from '$lib/config/appearance-config';
  import {
    EXPORT_FORMATS,
    EXPORT_SCALE_OPTIONS,
    FONT_SIZE_OPTIONS,
    MAX_WIDTH,
    MIN_WIDTH,
    clampWidth,
  } from '$lib/config/appearance-config';
  import type { LineMarks } from '$lib/marks/line-marks';
  import { SETTINGS_PANEL_ID } from '$lib/shortcuts/shortcuts';

  import LineMarksFields from './LineMarksFields.svelte';

  type Props = {
    appearance: AppearanceConfig;
    marks: LineMarks;
    onChange: (patch: Partial<AppearanceConfig>) => void;
    onMarksChange: (marks: LineMarks) => void;
  };
  let { appearance, marks, onChange, onMarksChange }: Props = $props();

  const WINDOW_OPTIONS: { value: WindowStyle; label: string }[] = [
    { value: 'controls', label: 'With controls' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'borderless', label: 'Borderless' },
  ];
  const fontSizeOptions = FONT_SIZE_OPTIONS.map((size) => ({
    value: String(size),
    label: `${size} px`,
  }));
  const formatOptions = EXPORT_FORMATS.map((format) => ({
    value: format,
    label: format.toUpperCase(),
  }));
  const scaleOptions = EXPORT_SCALE_OPTIONS.map((scale) => ({
    value: String(scale),
    label: `${scale}×`,
  }));
</script>

<Popover
  id={SETTINGS_PANEL_ID}
  label="More image settings"
>
  {#snippet trigger()}
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <circle
        cx="4"
        cy="10"
        r="1.4"
      /><circle
        cx="10"
        cy="10"
        r="1.4"
      />
      <circle
        cx="16"
        cy="10"
        r="1.4"
      />
    </svg>
  {/snippet}

  <div class="grid">
    <Field label="Width (px)">
      {#snippet children(labelId)}
        <NumberInput
          value={appearance.width}
          min={MIN_WIDTH}
          max={MAX_WIDTH}
          step={16}
          labelledby={labelId}
          onchange={(width) => onChange({ width: clampWidth(width) })}
        />
      {/snippet}
    </Field>

    <Field label="Font size">
      {#snippet children(labelId)}
        <Select
          value={String(appearance.fontSize)}
          options={fontSizeOptions}
          labelledby={labelId}
          onchange={(value) => onChange({ fontSize: Number(value) })}
        />
      {/snippet}
    </Field>

    <Field label="Download as">
      {#snippet children(labelId)}
        <Select
          value={appearance.exportFormat}
          options={formatOptions}
          labelledby={labelId}
          onchange={(value) => onChange({ exportFormat: value as ExportFormat })}
        />
      {/snippet}
    </Field>

    <Field label="Image scale">
      {#snippet children(labelId)}
        <Select
          value={String(appearance.exportScale)}
          options={scaleOptions}
          labelledby={labelId}
          onchange={(value) => onChange({ exportScale: Number(value) as ExportScale })}
        />
      {/snippet}
    </Field>

    <Field label="Window">
      {#snippet children(labelId)}
        <Select
          value={appearance.windowStyle}
          options={WINDOW_OPTIONS}
          labelledby={labelId}
          onchange={(value) => onChange({ windowStyle: value as WindowStyle })}
        />
      {/snippet}
    </Field>

    <Toggle
      label="Line numbers"
      checked={appearance.lineNumbers}
      onchange={(lineNumbers) => onChange({ lineNumbers })}
    />
    <Toggle
      label="Filename"
      checked={appearance.showTitle}
      onchange={(showTitle) => onChange({ showTitle })}
    />
    <Toggle
      label="Wrap code"
      checked={appearance.wrap}
      onchange={(wrap) => onChange({ wrap })}
    />
    <LineMarksFields
      {marks}
      onChange={onMarksChange}
    />
  </div>
</Popover>

<style>
  svg {
    width: 18px;
    height: 18px;
    fill: currentcolor;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--space-lg) var(--space-sm);
  }
  @media (max-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-sm);
    }
  }
</style>
