<script lang="ts">
  import Swatch from '$components/ui/Swatch.svelte';
  import type { AppearanceConfig } from '$lib/appearance-config';
  import { backgroundEnabled } from '$lib/appearance-config';
  import { BACKGROUND_PRESETS } from '$lib/backgrounds';

  type Props = {
    appearance: AppearanceConfig;
    onChange: (patch: Partial<AppearanceConfig>) => void;
  };
  let { appearance, onChange }: Props = $props();

  const CHECKER = 'conic-gradient(#e5e7eb 0 25%, #9ca3af 0 50%, #e5e7eb 0 75%, #9ca3af 0)';

  let enabled = $derived(backgroundEnabled(appearance));
</script>

<div
  class="swatches"
  role="group"
  aria-label="Background"
>
  <Swatch
    css={CHECKER}
    label="No background"
    selected={!enabled}
    onclick={() => onChange({ background: { mode: 'transparent' } })}
  />
  {#each BACKGROUND_PRESETS as preset (preset.id)}
    <Swatch
      css={preset.css}
      label={preset.label}
      selected={enabled && appearance.background.presetId === preset.id}
      onclick={() => onChange({ background: { mode: preset.mode, presetId: preset.id } })}
    />
  {/each}
</div>

<style>
  .swatches {
    display: flex;
    gap: var(--space-xs);
  }
</style>
