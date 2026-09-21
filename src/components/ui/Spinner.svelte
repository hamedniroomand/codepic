<script lang="ts">
  type Props = {
    label?: string;
  };
  let { label = 'Working' }: Props = $props();
</script>

<!-- Sized to match the 16px action icons exactly so swapping one in never reflows a button. -->
<svg
  class="spinner"
  viewBox="0 0 16 16"
  role="img"
  aria-label={label}
>
  <g class="rotor">
    <circle
      class="track"
      cx="8"
      cy="8"
      r="6.25"
    />
    <path d="M8 1.75a6.25 6.25 0 0 1 6.25 6.25" />
  </g>
</svg>

<style>
  .spinner {
    width: 16px;
    height: 16px;
    flex: none;
    fill: none;
    stroke: currentcolor;
    stroke-width: 1.75;
    stroke-linecap: round;
  }
  .rotor {
    transform-origin: 8px 8px;
    animation: spin 700ms linear infinite;
  }
  .track {
    opacity: 0.3;
  }
  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
  @keyframes pulse {
    50% {
      opacity: 0.35;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .rotor {
      animation: pulse 1.2s ease-in-out infinite;
    }
  }
</style>
