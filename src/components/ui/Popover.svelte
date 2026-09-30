<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { Snippet } from 'svelte';
  type Props = { label: string; id?: string; open?: boolean; trigger: Snippet; children: Snippet };
  let { label, id, open = $bindable(false), trigger, children }: Props = $props();
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    class="ui-icon-button"
    aria-label={label}
    title={label}>{@render trigger()}</Popover.Trigger
  >
  <Popover.Portal
    ><Popover.Content
      {id}
      class="ui-popover"
      sideOffset={8}>{@render children()}</Popover.Content
    ></Popover.Portal
  >
</Popover.Root>
