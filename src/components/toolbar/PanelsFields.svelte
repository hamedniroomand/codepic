<script lang="ts">
  import { X } from '@lucide/svelte';
  import { RadioGroup } from 'bits-ui';

  import Button from '$components/ui/Button.svelte';
  import Field from '$components/ui/Field.svelte';
  import SegmentedControl from '$components/ui/SegmentedControl.svelte';
  import type { AppearanceConfig, PanelLayout } from '$lib/config/appearance-config';
  import { MAX_PANELS, type Panel } from '$lib/panels/panels';

  type Props = {
    appearance: AppearanceConfig;
    panels: Panel[];
    activePanel: number;
    onChange: (patch: Partial<AppearanceConfig>) => void;
    onActivate: (index: number) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
  };
  let { appearance, panels, activePanel, onChange, onActivate, onAdd, onRemove }: Props = $props();

  const layouts = [
    { value: 'row', label: 'Side by side' },
    { value: 'column', label: 'Stacked' },
  ];

  function name(panel: Panel, index: number): string {
    return panel.title ? `Panel ${index + 1} (${panel.title})` : `Panel ${index + 1}`;
  }
</script>

<p>
  Show up to {MAX_PANELS} code windows in one image. The code, language, filename, line highlights and
  annotations settings change the selected panel.
</p>
{#if panels.length > 1}
  <Field label="Panel layout"
    >{#snippet children(labelId)}<SegmentedControl
        value={appearance.panelLayout}
        options={layouts}
        labelledby={labelId}
        onchange={(value) => onChange({ panelLayout: value as PanelLayout })}
      />{/snippet}</Field
  >
  <RadioGroup.Root
    class="panel-list"
    aria-label="Selected panel"
    value={String(activePanel)}
    onValueChange={(value) => onActivate(Number(value))}
  >
    {#each panels as panel, index (index)}
      <div class="panel-row">
        <RadioGroup.Item
          class="panel-item"
          value={String(index)}>{name(panel, index)}</RadioGroup.Item
        >
        {#if index > 0}
          <button
            type="button"
            class="remove"
            aria-label={`Remove ${name(panel, index)}`}
            onclick={() => onRemove(index)}><X size={14} /></button
          >
        {/if}
      </div>
    {/each}
  </RadioGroup.Root>
{/if}
<Button
  variant="subtle"
  disabled={panels.length >= MAX_PANELS}
  title={panels.length >= MAX_PANELS ? `You can add up to ${MAX_PANELS} panels.` : undefined}
  onclick={onAdd}>Add panel</Button
>

<style>
  p {
    margin: 0;
    color: var(--text-muted);
    font-size: 12px;
    line-height: 1.5;
  }
  :global(.panel-list) {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .panel-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  :global(.panel-item) {
    flex: 1;
    padding: 7px 10px;
    border: 1px solid var(--border-subtle);
    border-radius: 7px;
    background: transparent;
    color: var(--text-muted);
    font-size: 12px;
    text-align: left;
    cursor: pointer;
  }
  :global(.panel-item[data-state='checked']) {
    border-color: var(--accent);
    color: var(--text-strong);
  }
  .remove {
    display: grid;
    place-items: center;
    padding: 4px;
    border: 0;
    background: none;
    color: var(--text-muted);
    cursor: pointer;
  }
  .remove:hover {
    color: var(--text-strong);
  }
</style>
