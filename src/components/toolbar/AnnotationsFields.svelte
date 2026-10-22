<script lang="ts">
  import { X } from '@lucide/svelte';

  import Button from '$components/ui/Button.svelte';
  import SegmentedControl from '$components/ui/SegmentedControl.svelte';
  import TextInput from '$components/ui/TextInput.svelte';
  import { cleanText } from '$lib/config/appearance-config';
  import {
    ANNOTATION_KINDS,
    MAX_ANNOTATIONS,
    MAX_NOTE_CHARS,
    type Annotation,
    type AnnotationKind,
  } from '$lib/marks/annotations';

  type Props = {
    annotations: Annotation[];
    onChange: (annotations: Annotation[]) => void;
    onAnnotate: () => void;
  };
  let { annotations, onChange, onAnnotate }: Props = $props();

  const kinds = ANNOTATION_KINDS.map((value) => ({
    value,
    label: value === 'box' ? 'Box' : 'Underline',
  }));

  function where({ line, from, to }: Annotation): string {
    if (!from || !to) return `Line ${line}, whole line`;
    return from === to ? `Line ${line}, column ${from}` : `Line ${line}, columns ${from}–${to}`;
  }

  function update(index: number, patch: Partial<Annotation>): void {
    onChange(annotations.map((item, at) => (at === index ? { ...item, ...patch } : item)));
  }
</script>

<p>
  Select text in the code, then add an annotation. It covers one line: with more lines selected,
  only the first one gets it. With no selection, the line of the cursor gets it.
</p>
<Button
  variant="subtle"
  disabled={annotations.length >= MAX_ANNOTATIONS}
  onclick={onAnnotate}>Add annotation</Button
>
{#if annotations.length >= MAX_ANNOTATIONS}
  <p>You can add up to {MAX_ANNOTATIONS} annotations.</p>
{/if}
{#each annotations as annotation, index (annotation)}
  <div class="annotation">
    <div class="heading">
      <span>{where(annotation)}</span>
      <button
        type="button"
        class="remove"
        aria-label={`Remove the annotation on ${where(annotation)}`}
        onclick={() => onChange(annotations.filter((_, at) => at !== index))}
        ><X size={14} /></button
      >
    </div>
    <SegmentedControl
      value={annotation.kind}
      options={kinds}
      onchange={(kind) => update(index, { kind: kind as AnnotationKind })}
    />
    <TextInput
      value={annotation.note ?? ''}
      placeholder="Note (optional)"
      label={`Note for ${where(annotation)}`}
      onchange={(value) => update(index, { note: cleanText(value, MAX_NOTE_CHARS) || undefined })}
    />
  </div>
{/each}

<style>
  p {
    margin: 0;
    color: var(--text-muted);
    font-size: 12px;
    line-height: 1.5;
  }
  .annotation {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
  }
  .heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text-strong);
    font-size: 12px;
  }
  .remove {
    display: grid;
    place-items: center;
    padding: 2px;
    border: 0;
    background: none;
    color: var(--text-muted);
    cursor: pointer;
  }
  .remove:hover {
    color: var(--text-strong);
  }
</style>
