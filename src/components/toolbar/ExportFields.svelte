<script lang="ts">
  import Field from '$components/ui/Field.svelte';
  import Select from '$components/ui/Select.svelte';
  import Toggle from '$components/ui/Toggle.svelte';
  import type { AppearanceConfig, ExportFormat, ExportScale } from '$lib/config/appearance-config';
  import {
    END_PAUSES,
    EXPORT_FORMATS,
    EXPORT_SCALE_OPTIONS,
    TYPING_SPEEDS,
  } from '$lib/config/appearance-config';
  import { GIF_FPS } from '$lib/export/animation';

  let {
    appearance,
    onChange,
  }: { appearance: AppearanceConfig; onChange: (patch: Partial<AppearanceConfig>) => void } =
    $props();
  const formats = EXPORT_FORMATS.map((format) => ({ value: format, label: format.toUpperCase() }));
  const speedNames = ['Slow', 'Normal', 'Fast'];
  const speeds = TYPING_SPEEDS.map((speed, index) => ({
    value: String(speed),
    label: `${speedNames[index]} (${speed} characters a second)`,
  }));
  const pauses = END_PAUSES.map((pause) => ({
    value: String(pause),
    label: `${pause} ${pause === 1 ? 'second' : 'seconds'}`,
  }));
  const scales = EXPORT_SCALE_OPTIONS.map((scale) => ({
    value: String(scale),
    label: `${scale}×`,
  }));
</script>

<div class="pair">
  <Field label="Format"
    >{#snippet children(labelId)}<Select
        value={appearance.exportFormat}
        options={formats}
        labelledby={labelId}
        onchange={(value) => onChange({ exportFormat: value as ExportFormat })}
      />{/snippet}</Field
  >
  <Field label="Image scale"
    >{#snippet children(labelId)}<Select
        value={String(appearance.exportScale)}
        options={scales}
        labelledby={labelId}
        onchange={(value) => onChange({ exportScale: Number(value) as ExportScale })}
      />{/snippet}</Field
  >
</div>
{#if appearance.exportFormat === 'gif'}
  <div class="pair">
    <Field label="Typing speed"
      >{#snippet children(labelId)}<Select
          value={String(appearance.typingSpeed)}
          options={speeds}
          labelledby={labelId}
          onchange={(value) => onChange({ typingSpeed: Number(value) })}
        />{/snippet}</Field
    >
    <Field label="Pause at the end"
      >{#snippet children(labelId)}<Select
          value={String(appearance.endPause)}
          options={pauses}
          labelledby={labelId}
          onchange={(value) => onChange({ endPause: Number(value) })}
        />{/snippet}</Field
    >
  </div>
  <Toggle
    label="Play again from the start"
    checked={appearance.loop}
    onchange={(loop) => onChange({ loop })}
  />
{/if}
<p>
  {#if appearance.exportFormat === 'png'}
    {appearance.width * appearance.exportScale} px wide at {appearance.exportScale}× resolution
  {:else if appearance.exportFormat === 'gif'}
    The code types itself in. {appearance.width} px wide at 1× resolution, {GIF_FPS} frames a second.
    Copy image copies a PNG, not the animation.
  {:else}
    Scalable SVG with an embedded code font
  {/if}
</p>

<style>
  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  p {
    margin: 0;
    color: var(--text-muted);
    font-size: 11px;
    line-height: 1.5;
  }
</style>
