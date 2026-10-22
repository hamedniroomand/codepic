import { characters } from '$lib/config/appearance-config';

export const GIF_FPS = 20;

/** An error whose message is fit to show the user. */
export class AnimationError extends Error {}
/** Long code types more characters in each frame, so a GIF never gets more frames than this. */
export const MAX_FRAMES = 600;

export type Schedule = {
  /** How many characters show in each frame. The last frame shows all of them. */
  counts: number[];
  /** Time each frame shows, in milliseconds. */
  delay: number;
  /** Time the last frame shows, in milliseconds. */
  lastDelay: number;
};

/** Frames for a typing animation of `total` characters. Pure, so tests can check it. */
export function revealSchedule(
  total: number,
  speed: number,
  fps: number,
  pauseMs: number,
  maxFrames = MAX_FRAMES,
): Schedule {
  const delay = Math.round(1000 / fps);
  const typing = Math.min(maxFrames - 1, Math.max(1, Math.ceil((total / speed) * fps)));
  const counts = [0];
  for (let frame = 1; frame <= typing; frame++) counts.push(Math.round((total * frame) / typing));
  return { counts, delay, lastDelay: Math.max(delay, Math.round(pauseMs)) };
}

export type Rect = { x: number; y: number; width: number; height: number };

/**
 * The place of every character of the code, in pixels of the captured image, in reading order
 * (panel by panel, line by line). One character can have more than one rect, for example
 * when a long line wraps.
 */
export function glyphRects(frame: HTMLElement, scale: number): Rect[][] {
  const origin = frame.getBoundingClientRect();
  // The frame can be shrunk to fit a fixed shape, so convert from screen size to image size.
  const ratio = (frame.offsetWidth / origin.width) * scale;
  const glyphs: Rect[][] = [];
  const range = document.createRange();
  for (const code of frame.querySelectorAll('.code')) {
    const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      let offset = 0;
      for (const char of characters(node.textContent ?? '')) {
        range.setStart(node, offset);
        range.setEnd(node, offset + char.length);
        offset += char.length;
        if (!char.trim()) continue;
        glyphs.push(
          [...range.getClientRects()].map((rect) => ({
            x: (rect.left - origin.left) * ratio,
            y: (rect.top - origin.top) * ratio,
            width: rect.width * ratio,
            height: rect.height * ratio,
          })),
        );
      }
    }
  }
  return glyphs;
}

type GifOptions = {
  base: HTMLCanvasElement;
  full: HTMLCanvasElement;
  glyphs: Rect[][];
  schedule: Schedule;
  loop: boolean;
  onProgress: (frame: number, total: number) => void;
};

/**
 * Builds the GIF from two captures: `base` without the code text and `full` with it. Each
 * frame copies the newly shown characters from `full`, so the last frame is `full` itself.
 */
export async function encodeGif(options: GifOptions): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc').catch(() => {
    throw new AnimationError('The GIF maker could not load. Check the connection.');
  });
  const { base, full, glyphs, schedule } = options;
  const { width, height } = full;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new AnimationError('The image is too large for a GIF. Use a smaller width.');
  context.drawImage(base, 0, 0);

  // One palette for every frame, from the full image, so colors do not change between frames
  // and each frame skips the slow color search.
  const palette = quantize(
    full.getContext('2d')?.getImageData(0, 0, width, height).data ?? new Uint8ClampedArray(),
    256,
  );
  const gif = GIFEncoder();
  let shown = 0;
  const last = schedule.counts.length - 1;
  for (const [frame, count] of schedule.counts.entries()) {
    if (frame === last) context.drawImage(full, 0, 0);
    for (; shown < count; shown++) {
      for (const rect of glyphs[shown] ?? []) {
        const x = Math.floor(rect.x);
        const y = Math.floor(rect.y);
        const w = Math.ceil(rect.x + rect.width) - x;
        const h = Math.ceil(rect.y + rect.height) - y;
        if (w > 0 && h > 0) context.drawImage(full, x, y, w, h, x, y, w, h);
      }
    }
    const { data } = context.getImageData(0, 0, width, height);
    gif.writeFrame(applyPalette(data, palette), width, height, {
      palette,
      delay: frame === last ? schedule.lastDelay : schedule.delay,
      ...(frame === 0 ? { repeat: options.loop ? 0 : -1 } : {}),
    });
    options.onProgress(frame + 1, schedule.counts.length);
    // Let the page paint, so the progress shows and the tab stays responsive.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}
