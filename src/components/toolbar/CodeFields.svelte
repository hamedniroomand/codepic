<script lang="ts">
  import Combobox from '$components/ui/Combobox.svelte';
  import Field from '$components/ui/Field.svelte';
  import Select from '$components/ui/Select.svelte';
  import Toggle from '$components/ui/Toggle.svelte';
  import type { AppearanceConfig, WindowStyle } from '$lib/config/appearance-config';
  import { FONT_SIZE_OPTIONS } from '$lib/config/appearance-config';
  import { LANGUAGES } from '$lib/config/languages';

  let {
    appearance,
    languageDetected,
    onChange,
  }: {
    appearance: AppearanceConfig;
    languageDetected: boolean;
    onChange: (patch: Partial<AppearanceConfig>) => void;
  } = $props();
  const languages = LANGUAGES.map((language) => ({ value: language.id, label: language.label }));
  const fonts = FONT_SIZE_OPTIONS.map((size) => ({ value: String(size), label: `${size} px` }));
  const windows = [
    { value: 'controls', label: 'With controls' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'borderless', label: 'Borderless' },
  ];
</script>

<Field label={languageDetected ? 'Language (detected)' : 'Language'}
  >{#snippet children(labelId)}<Combobox
      value={appearance.language}
      options={languages}
      labelledby={labelId}
      onchange={(language) => onChange({ language })}
    />{/snippet}</Field
>
<div class="pair">
  <Field label="Font size"
    >{#snippet children(labelId)}<Select
        value={String(appearance.fontSize)}
        options={fonts}
        labelledby={labelId}
        onchange={(value) => onChange({ fontSize: Number(value) })}
      />{/snippet}</Field
  >
  <Field label="Window"
    >{#snippet children(labelId)}<Select
        value={appearance.windowStyle}
        options={windows}
        labelledby={labelId}
        onchange={(value) => onChange({ windowStyle: value as WindowStyle })}
      />{/snippet}</Field
  >
</div>
<Toggle
  label="Line numbers"
  checked={appearance.lineNumbers}
  onchange={(lineNumbers) => onChange({ lineNumbers })}
/>
<Toggle
  label="Show filename"
  checked={appearance.showTitle}
  onchange={(showTitle) => onChange({ showTitle })}
/>
<Toggle
  label="Wrap long lines"
  checked={appearance.wrap}
  onchange={(wrap) => onChange({ wrap })}
/>

<style>
  .pair {
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 12px;
  }
</style>
