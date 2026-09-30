import type { BackgroundConfig } from '$lib/appearance-config';
import { backgroundStyle } from '$lib/backgrounds';

const GRADIENT_STOP = /(#[0-9a-f]{3,8})\s+(\d+)%/gi;

/**
 * SVG paint for the card background. Gradients follow the CSS 135deg line: it runs
 * corner to corner through the centre, and its length depends on the box shape.
 */
export function backgroundPaint(
  background: BackgroundConfig,
  width: number,
  height: number,
): { defs: string; fill: string } {
  const { backgroundColor, backgroundImage } = backgroundStyle(background);
  const stops = [...(backgroundImage ?? '').matchAll(GRADIENT_STOP)];
  if (!stops.length) return { defs: '', fill: backgroundColor ?? 'none' };

  const half = ((width + height) * Math.SQRT1_2) / 2;
  const reach = half * Math.SQRT1_2;
  const [cx, cy] = [width / 2, height / 2];
  const offsets = stops
    .map(([, color, at]) => `<stop offset="${at}%" stop-color="${color}"/>`)
    .join('');
  const defs = `<linearGradient id="background" gradientUnits="userSpaceOnUse" x1="${cx - reach}" y1="${cy - reach}" x2="${cx + reach}" y2="${cy + reach}">${offsets}</linearGradient>`;
  return { defs, fill: 'url(#background)' };
}
