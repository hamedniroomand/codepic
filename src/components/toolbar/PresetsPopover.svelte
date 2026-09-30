<script lang="ts">
  import Button from '$components/ui/Button.svelte';
  import Popover from '$components/ui/Popover.svelte';
  import TextInput from '$components/ui/TextInput.svelte';
  import type { AppearanceConfig } from '$lib/appearance-config';
  import { downloadBlob } from '$lib/export/download';
  import { BUILTIN_PRESETS } from '$lib/presets/builtin-presets';
  import { lookOf, type Look } from '$lib/presets/presets';
  import { createPresetStore } from '$lib/presets/presets.svelte';

  type Props = {
    appearance: AppearanceConfig;
    onApply: (look: Look) => void;
    onStatus: (message: string) => void;
  };
  let { appearance, onApply, onStatus }: Props = $props();

  const store = createPresetStore();
  let name = $state('');

  function saveCurrent(): void {
    store.save(name, lookOf(appearance));
    name = '';
  }

  function exportPresets(): void {
    downloadBlob(new Blob([store.export()], { type: 'application/json' }), 'codepic-presets.json');
  }

  async function importPresets(event: Event & { currentTarget: HTMLInputElement }): Promise<void> {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const count = store.import(await file.text());
      onStatus(`Imported ${count} preset${count === 1 ? '' : 's'}.`);
    } catch (error) {
      onStatus(error instanceof Error ? error.message : 'Could not import that file.');
    }
    input.value = '';
  }
</script>

<Popover label="Presets">
  {#snippet trigger()}
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="6"
        height="6"
        rx="1.5"
      />
      <rect
        x="11"
        y="3"
        width="6"
        height="6"
        rx="1.5"
      />
      <rect
        x="3"
        y="11"
        width="6"
        height="6"
        rx="1.5"
      />
      <rect
        x="11"
        y="11"
        width="6"
        height="6"
        rx="1.5"
      />
    </svg>
  {/snippet}

  <div class="presets">
    <h2>Built in</h2>
    <div class="row">
      {#each BUILTIN_PRESETS as preset (preset.id)}
        <Button onclick={() => onApply(preset.look)}>{preset.name}</Button>
      {/each}
    </div>

    {#if store.saved.length}
      <h2>Saved</h2>
      {#each store.saved as preset (preset.id)}
        <div class="saved">
          <TextInput
            value={preset.name}
            onchange={(next) => store.rename(preset.id, next)}
          />
          <Button onclick={() => onApply(preset.look)}>Apply</Button>
          <Button
            label="Delete {preset.name}"
            onclick={() => store.remove(preset.id)}>Delete</Button
          >
        </div>
      {/each}
    {/if}

    <h2>Save the current look</h2>
    <form
      class="saved"
      onsubmit={(event) => {
        event.preventDefault();
        saveCurrent();
      }}
    >
      <TextInput
        value={name}
        placeholder="Preset name"
        onchange={(next) => (name = next)}
      />
      <Button
        onclick={saveCurrent}
        disabled={!name.trim()}>Save</Button
      >
    </form>

    <div class="row">
      <Button
        onclick={exportPresets}
        disabled={!store.saved.length}>Export saved</Button
      >
      <label class="import">
        Import
        <input
          type="file"
          accept="application/json"
          onchange={importPresets}
        />
      </label>
    </div>
  </div>
</Popover>

<style>
  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentcolor;
    stroke-width: 1.5;
  }
  .presets {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
  h2 {
    margin: 0;
    color: var(--text-muted);
    font-size: var(--text-label);
    font-weight: var(--weight-label);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }
  .saved {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--space-xs);
  }
  .import {
    display: inline-flex;
    align-items: center;
    min-height: var(--control-height-lg);
    padding: 0 var(--space-sm);
    border: 1px solid var(--border-base);
    border-radius: var(--radius-sm);
    color: var(--text-strong);
    font-size: var(--text-label);
    font-weight: var(--weight-label);
    cursor: pointer;
  }
  .import:hover {
    background: var(--surface-hover);
  }
  .import input {
    display: none;
  }
</style>
