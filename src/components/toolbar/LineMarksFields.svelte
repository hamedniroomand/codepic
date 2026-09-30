<script lang="ts">
  import Field from '$components/ui/Field.svelte';
  import TextInput from '$components/ui/TextInput.svelte';
  import { MARK_KINDS, type LineMarks, type MarkKind } from '$lib/marks/line-marks';
  import { formatLineRanges, parseLineRanges } from '$lib/marks/line-ranges';

  type Props = {
    marks: LineMarks;
    onChange: (marks: LineMarks) => void;
  };
  let { marks, onChange }: Props = $props();

  const FIELDS: Record<MarkKind, { label: string; placeholder: string }> = {
    emphasized: { label: 'Highlight', placeholder: '1,3-5' },
    added: { label: 'Added (+)', placeholder: '2,4' },
    removed: { label: 'Removed (−)', placeholder: '6-8' },
  };
</script>

{#each MARK_KINDS as kind (kind)}
  <Field label={FIELDS[kind].label}>
    {#snippet children(labelId)}
      <TextInput
        value={formatLineRanges(marks[kind])}
        placeholder={FIELDS[kind].placeholder}
        labelledby={labelId}
        onchange={(value) => onChange({ ...marks, [kind]: parseLineRanges(value) })}
      />
    {/snippet}
  </Field>
{/each}
