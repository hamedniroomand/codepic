<script lang="ts">
  import { RadioGroup } from 'bits-ui';

  import SegmentedControl from '$components/ui/SegmentedControl.svelte';
  import Swatch from '$components/ui/Swatch.svelte';
  import type { AppearanceConfig, BackgroundConfig } from '$lib/config/appearance-config';
  import { backgroundEnabled } from '$lib/config/appearance-config';
  import { BACKGROUND_PRESETS, backgroundStyle, customBackground } from '$lib/config/backgrounds';

  type Props = {
    appearance: AppearanceConfig;
    onChange: (patch: Partial<AppearanceConfig>) => void;
  };
  let { appearance, onChange }: Props = $props();

  const CHECKER = 'conic-gradient(#e5e7eb 0 25%, #9ca3af 0 50%, #e5e7eb 0 75%, #9ca3af 0)';
  const RAINBOW = 'conic-gradient(#f43f5e, #f59e0b, #22c55e, #3b82f6, #a855f7, #f43f5e)';
  const DEFAULT_CUSTOM: BackgroundConfig = {
    mode: 'gradient',
    presetId: '',
    solidColor: '#1e293b',
    gradientFrom: '#4c1d95',
    gradientTo: '#c084fc',
  };
  const MODES = [
    { value: 'solid', label: 'Solid' },
    { value: 'gradient', label: 'Gradient' },
  ];

  let background = $derived(appearance.background);
  let custom = $derived(customBackground(background));
  let selected = $derived(
    !backgroundEnabled(appearance) ? 'transparent' : custom ? 'custom' : background.presetId,
  );
  let customCss = $derived.by(() => {
    if (!custom) return RAINBOW;
    const style = backgroundStyle(background);
    return style.backgroundImage !== 'none' ? style.backgroundImage : style.backgroundColor;
  });

  function setBackground(patch: Partial<BackgroundConfig>): void {
    onChange({ background: { ...background, ...patch } });
  }

  function setMode(mode: string): void {
    if (mode === 'solid')
      setBackground({
        mode,
        solidColor: background.solidColor ?? background.gradientFrom ?? DEFAULT_CUSTOM.solidColor,
      });
    else
      setBackground({
        mode: 'gradient',
        gradientFrom:
          background.gradientFrom ?? background.solidColor ?? DEFAULT_CUSTOM.gradientFrom,
        gradientTo: background.gradientTo ?? DEFAULT_CUSTOM.gradientTo,
      });
  }
</script>

<RadioGroup.Root
  class="swatches"
  orientation="horizontal"
  aria-label="Background"
  value={selected}
  onValueChange={(value) => {
    if (value === 'transparent')
      onChange({ background: { ...appearance.background, mode: 'transparent' } });
    else if (value === 'custom')
      onChange({
        background: {
          mode: 'gradient',
          presetId: '',
          solidColor: background.solidColor ?? DEFAULT_CUSTOM.solidColor,
          gradientFrom: background.gradientFrom ?? DEFAULT_CUSTOM.gradientFrom,
          gradientTo: background.gradientTo ?? DEFAULT_CUSTOM.gradientTo,
        },
      });
    else {
      const preset = BACKGROUND_PRESETS.find((item) => item.id === value);
      if (preset)
        onChange({
          background: {
            ...appearance.background,
            mode: preset.mode,
            presetId: preset.id,
            solidColor: null,
            gradientFrom: null,
            gradientTo: null,
          },
        });
    }
  }}
>
  <Swatch
    css={CHECKER}
    label="No background"
    value="transparent"
  />
  {#each BACKGROUND_PRESETS as preset (preset.id)}<Swatch
      css={preset.css}
      label={preset.label}
      value={preset.id}
    />{/each}
  <Swatch
    css={customCss}
    label="Custom colors"
    value="custom"
  />
</RadioGroup.Root>

{#if custom}
  <div class="custom">
    <SegmentedControl
      value={background.mode}
      options={MODES}
      onchange={setMode}
    />
    {#if background.mode === 'solid'}
      <input
        type="color"
        aria-label="Background color"
        value={background.solidColor}
        oninput={(event) => setBackground({ solidColor: event.currentTarget.value })}
      />
    {:else}
      <input
        type="color"
        aria-label="Gradient start color"
        value={background.gradientFrom}
        oninput={(event) => setBackground({ gradientFrom: event.currentTarget.value })}
      />
      <input
        type="color"
        aria-label="Gradient end color"
        value={background.gradientTo}
        oninput={(event) => setBackground({ gradientTo: event.currentTarget.value })}
      />
    {/if}
  </div>
{/if}

<style>
  :global(.swatches) {
    display: grid;
    grid-template-columns: repeat(10, minmax(22px, 1fr));
    gap: 7px;
    width: 100%;
  }
  .custom {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
  }
  .custom :global(.segments) {
    flex: 1;
  }
  input[type='color'] {
    width: 38px;
    height: 36px;
    padding: 2px;
    border: 1px solid var(--border-base);
    border-radius: 8px;
    background: var(--surface-well);
    cursor: pointer;
  }
</style>
