<script lang="ts">
  import Field from '$components/ui/Field.svelte';
  import Select from '$components/ui/Select.svelte';
  import type { AppearanceConfig, ExportFormat, ExportScale } from '$lib/config/appearance-config';
  import { EXPORT_FORMATS, EXPORT_SCALE_OPTIONS } from '$lib/config/appearance-config';

  let {
    appearance,
    onChange,
  }: { appearance: AppearanceConfig; onChange: (patch: Partial<AppearanceConfig>) => void } =
    $props();
  const formats = EXPORT_FORMATS.map((format) => ({ value: format, label: format.toUpperCase() }));
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
<p>
  {appearance.exportFormat === 'png'
    ? `${appearance.width * appearance.exportScale} px wide at ${appearance.exportScale}× resolution`
    : 'Scalable SVG with an embedded code font'}
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
