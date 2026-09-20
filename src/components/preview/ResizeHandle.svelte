<script lang="ts">
  type Props = {
    side: 'left' | 'right';
    width: number;
    scale: number;
    onResize: (width: number) => void;
  };
  let { side, width, scale, onResize }: Props = $props();

  const STEP_PX = 16;
  let dragging = $state(false);
  let origin = { x: 0, width: 0, scale: 1 };

  // Dragging one edge grows both sides, so the change counts double.
  let direction = $derived(side === 'right' ? 1 : -1);

  function start(event: PointerEvent): void {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    origin = { x: event.clientX, width, scale };
    dragging = true;
  }

  function move(event: PointerEvent): void {
    if (!dragging) return;
    onResize(origin.width + ((event.clientX - origin.x) * direction * 2) / origin.scale);
  }

  function nudge(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    onResize(width + (event.key === 'ArrowRight' ? STEP_PX : -STEP_PX) * direction);
  }
</script>

<button
  type="button"
  class="handle {side}"
  aria-label={side === 'left' ? 'Resize image from left' : 'Resize image from right'}
  title="Drag to resize. Use arrow keys for small changes."
  onpointerdown={start}
  onpointermove={move}
  onpointerup={() => (dragging = false)}
  onpointercancel={() => (dragging = false)}
  onlostpointercapture={() => (dragging = false)}
  onkeydown={nudge}
></button>

<style>
  .handle {
    position: absolute;
    top: calc(50% - 20px);
    width: 20px;
    height: 40px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: ew-resize;
    touch-action: none;
  }
  .handle::after {
    content: '';
    display: block;
    width: 4px;
    height: 24px;
    margin: auto;
    border-radius: var(--radius-sm);
    background: #d8dce6;
    box-shadow: 0 1px 4px #0004;
  }
  .handle:hover::after {
    background: #fff;
  }
  .left {
    left: -10px;
  }
  .right {
    right: -10px;
  }
</style>
