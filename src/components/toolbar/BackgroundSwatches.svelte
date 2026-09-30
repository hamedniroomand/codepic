<script lang="ts">
  import { RadioGroup } from 'bits-ui';

  import Swatch from '$components/ui/Swatch.svelte';
  import type { AppearanceConfig } from '$lib/config/appearance-config';
  import { backgroundEnabled } from '$lib/config/appearance-config';
  import { BACKGROUND_PRESETS } from '$lib/config/backgrounds';

  type Props = {
    appearance: AppearanceConfig;
    onChange: (patch: Partial<AppearanceConfig>) => void;
  };
  let { appearance, onChange }: Props = $props();

  const CHECKER = 'conic-gradient(#e5e7eb 0 25%, #9ca3af 0 50%, #e5e7eb 0 75%, #9ca3af 0)';

  let enabled = $derived(backgroundEnabled(appearance));
</script>

<RadioGroup.Root
  class="swatches"
  orientation="horizontal"
  aria-label="Background"
  value={enabled ? appearance.background.presetId : 'transparent'}
  onValueChange={(value) => {
    if (value === 'transparent')
      onChange({ background: { ...appearance.background, mode: 'transparent' } });
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
</RadioGroup.Root>

<style>
  :global(.swatches) {
    display: grid;
    grid-template-columns: repeat(9, minmax(22px, 1fr));
    gap: 7px;
    width: 100%;
  }
</style>
