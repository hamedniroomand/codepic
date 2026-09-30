<script lang="ts">
  import { LayoutGrid, Upload, Download, Trash2, Check } from '@lucide/svelte';

  import Button from '$components/ui/Button.svelte';
  import Dialog from '$components/ui/Dialog.svelte';
  import Field from '$components/ui/Field.svelte';
  import TextInput from '$components/ui/TextInput.svelte';
  import type { AppearanceConfig } from '$lib/config/appearance-config';
  import { downloadBlob } from '$lib/export/download';
  import { BUILTIN_PRESETS } from '$lib/presets/builtin-presets';
  import { lookOf, type Look } from '$lib/presets/presets';
  import type { PresetStore } from '$lib/presets/presets.svelte';

  import PresetPreview from './PresetPreview.svelte';

  type Props = {
    appearance: AppearanceConfig;
    store: PresetStore;
    onApply: (look: Look) => void;
    onStatus: (message: string) => void;
  };
  let { appearance, store, onApply, onStatus }: Props = $props();
  let name = $state('');
  let open = $state(false);
  function apply(look: Look): void {
    onApply(look);
    open = false;
  }
  function saveCurrent(): void {
    if (!name.trim()) return;
    store.save(name.trim(), lookOf(appearance));
    onStatus(`Saved “${name.trim()}”.`);
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

<Dialog
  bind:open
  title="Presets"
  description="Start with a look, or save one of your own."
>
  {#snippet trigger()}<LayoutGrid size={14} /><span>Presets</span>{/snippet}
  <div class="presets">
    <div class="builtins">
      {#each BUILTIN_PRESETS as preset (preset.id)}<PresetPreview
          look={preset.look}
          name={preset.name}
          onApply={() => apply(preset.look)}
        />{/each}
    </div>
    <section>
      <h3>Your presets</h3>
      {#if store.saved.length}
        <div class="saved-list">
          {#each store.saved as preset (preset.id)}
            <div class="saved">
              <TextInput
                value={preset.name}
                label="Rename {preset.name} preset"
                onchange={(next) => store.rename(preset.id, next)}
              /><Button
                label="Apply {preset.name}"
                onclick={() => apply(preset.look)}><Check size={16} /></Button
              ><Button
                variant="subtle"
                label="Delete {preset.name}"
                onclick={() => store.remove(preset.id)}><Trash2 size={16} /></Button
              >
            </div>
          {/each}
        </div>
      {:else}<p class="empty">
          Your saved looks will appear here. Save the current settings to get started.
        </p>{/if}
    </section>
    <form
      onsubmit={(event) => {
        event.preventDefault();
        saveCurrent();
      }}
    >
      <Field label="Save the current look"
        >{#snippet children(labelId)}<div class="save-row">
            <TextInput
              live
              value={name}
              placeholder="Give your preset a name"
              labelledby={labelId}
              onchange={(next) => (name = next)}
            /><Button
              type="submit"
              variant="primary"
              disabled={!name.trim()}>Save preset</Button
            >
          </div>{/snippet}</Field
      >
    </form>
    <div class="transfer">
      <label class="import"
        ><Upload size={14} /> Import presets<input
          type="file"
          accept="application/json"
          aria-label="Import presets"
          onchange={importPresets}
        /></label
      ><Button
        variant="subtle"
        onclick={exportPresets}
        disabled={!store.saved.length}><Download size={14} />Export saved</Button
      >
    </div>
  </div>
</Dialog>

<style>
  .presets {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .builtins {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px 14px;
  }
  section {
    border-top: 1px solid var(--border-subtle);
    padding-top: 20px;
  }
  h3 {
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 550;
    color: var(--text-strong);
  }
  .empty {
    margin: 0;
    padding: 14px;
    border: 1px dashed var(--border-base);
    border-radius: 8px;
    color: var(--text-muted);
    font-size: 12px;
    line-height: 1.6;
  }
  .saved-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .saved {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 6px;
  }
  .save-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }
  .transfer {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    border-top: 1px solid var(--border-subtle);
    padding-top: 16px;
  }
  .import {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 10px;
    border-radius: 8px;
    color: var(--text-muted);
    font-size: 12px;
    cursor: pointer;
  }
  .import:hover {
    background: var(--surface-active);
    color: var(--text-strong);
  }
  .import:focus-within {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .import input {
    position: absolute;
    inset: 0;
    width: 100%;
    opacity: 0;
    cursor: pointer;
  }
  @media (max-width: 480px) {
    .builtins {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .save-row {
      grid-template-columns: 1fr;
    }
  }
</style>
