<script lang="ts">
  import { ChevronDown } from '@lucide/svelte';
  import { Collapsible } from 'bits-ui';

  import Field from '$components/ui/Field.svelte';
  import NumberInput from '$components/ui/NumberInput.svelte';
  import SegmentedControl from '$components/ui/SegmentedControl.svelte';
  import type { AppearanceConfig, AspectRatio, PaddingPx } from '$lib/config/appearance-config';
  import {
    ASPECT_RATIOS,
    PADDING_OPTIONS,
    MIN_WIDTH,
    MAX_WIDTH,
    clampWidth,
  } from '$lib/config/appearance-config';
  import type { Annotation } from '$lib/marks/annotations';
  import type { LineMarks } from '$lib/marks/line-marks';

  import AnnotationsFields from './AnnotationsFields.svelte';
  import LineMarksFields from './LineMarksFields.svelte';

  let {
    appearance,
    marks,
    annotations,
    onChange,
    onMarksChange,
    onAnnotationsChange,
    onAnnotate,
  }: {
    appearance: AppearanceConfig;
    marks: LineMarks;
    annotations: Annotation[];
    onChange: (patch: Partial<AppearanceConfig>) => void;
    onMarksChange: (marks: LineMarks) => void;
    onAnnotationsChange: (annotations: Annotation[]) => void;
    onAnnotate: () => void;
  } = $props();
  const shapes = ASPECT_RATIOS.map((value) => ({
    value,
    label: value === 'free' ? 'Free' : value,
  }));
  const padding = PADDING_OPTIONS.map((value) => ({ value: String(value), label: String(value) }));
</script>

<Field label="Image shape"
  >{#snippet children(labelId)}<SegmentedControl
      value={appearance.aspect}
      options={shapes}
      labelledby={labelId}
      onchange={(value) => onChange({ aspect: value as AspectRatio })}
    />{/snippet}</Field
>
<Field label="Image width (px)"
  >{#snippet children(labelId)}<NumberInput
      value={appearance.width}
      min={MIN_WIDTH}
      max={MAX_WIDTH}
      step={16}
      labelledby={labelId}
      onchange={(width) => onChange({ width: clampWidth(width) })}
    />{/snippet}</Field
>
<Field label="Padding (px)"
  >{#snippet children(labelId)}<SegmentedControl
      value={String(appearance.paddingPx)}
      options={padding}
      labelledby={labelId}
      onchange={(value) => onChange({ paddingPx: Number(value) as PaddingPx })}
    />{/snippet}</Field
>
<Collapsible.Root>
  <Collapsible.Trigger class="marks-trigger"
    >Line highlights & diffs<ChevronDown size={13} /></Collapsible.Trigger
  >
  <Collapsible.Content>
    <div class="marks">
      <p>Enter line numbers or ranges, like 1, 3–5.</p>
      <LineMarksFields
        {marks}
        onChange={onMarksChange}
      />
    </div>
  </Collapsible.Content>
</Collapsible.Root>
<Collapsible.Root>
  <Collapsible.Trigger class="marks-trigger"
    >Annotations{annotations.length ? ` (${annotations.length})` : ''}<ChevronDown
      size={13}
    /></Collapsible.Trigger
  >
  <Collapsible.Content>
    <div class="marks">
      <AnnotationsFields
        {annotations}
        onChange={onAnnotationsChange}
        {onAnnotate}
      />
    </div>
  </Collapsible.Content>
</Collapsible.Root>

<style>
  :global(.marks-trigger) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    color: var(--text-muted);
    font-size: 12px;
    cursor: pointer;
    padding: 5px 0;
  }
  :global(.marks-trigger:hover) {
    color: var(--text-strong);
  }
  .marks {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 12px;
  }
  p {
    margin: 0;
    color: var(--text-muted);
    font-size: 12px;
    line-height: 1.5;
  }
</style>
