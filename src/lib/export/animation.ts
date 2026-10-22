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

type FrameSource = {
  base: HTMLCanvasElement;
  full: HTMLCanvasElement;
  glyphs: Rect[][];
  schedule: Schedule;
  onProgress: (frame: number, total: number) => void;
};

type GifOptions = FrameSource & { loop: boolean };

/**
 * Draws each frame from two captures: `base` without the code text and `full` with it. Each
 * frame copies the newly shown characters from `full`, so the last frame is `full` itself.
 * With `even`, the canvas grows to even sizes, which a video encoder needs.
 */
async function drawFrames(
  source: FrameSource,
  even: boolean,
  onFrame: (context: CanvasRenderingContext2D, frame: number, duration: number) => Promise<void>,
): Promise<void> {
  const { base, full, glyphs, schedule } = source;
  const canvas = document.createElement('canvas');
  canvas.width = even ? Math.ceil(full.width / 2) * 2 : full.width;
  canvas.height = even ? Math.ceil(full.height / 2) * 2 : full.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new AnimationError('The image is too large. Use a smaller width.');
  // A stretched copy fills the extra pixel of an even size with the edge color.
  context.drawImage(base, 0, 0, canvas.width, canvas.height);
  context.drawImage(base, 0, 0);

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
    await onFrame(context, frame, frame === last ? schedule.lastDelay : schedule.delay);
    source.onProgress(frame + 1, schedule.counts.length);
    // Let the page paint, so the progress shows and the tab stays responsive.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

export async function encodeGif(options: GifOptions): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc').catch(() => {
    throw new AnimationError('The GIF maker could not load. Check the connection.');
  });
  const { width, height } = options.full;
  // One palette for every frame, from the full image, so colors do not change between frames
  // and each frame skips the slow color search.
  const palette = quantize(
    options.full.getContext('2d')?.getImageData(0, 0, width, height).data ??
      new Uint8ClampedArray(),
    256,
  );
  const gif = GIFEncoder();
  await drawFrames(options, false, async (context, frame, duration) => {
    const { data } = context.getImageData(0, 0, width, height);
    gif.writeFrame(applyPalette(data, palette), width, height, {
      palette,
      delay: duration,
      ...(frame === 0 ? { repeat: options.loop ? 0 : -1 } : {}),
    });
  });
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}

// H.264 levels from small to large. A larger image needs a higher level.
const AVC_CODECS = ['avc1.42001f', 'avc1.4d0028', 'avc1.4d0033', 'avc1.640033', 'avc1.640034'];
/** Frames that can wait in the encoder before the next one is drawn. */
const MAX_QUEUED_FRAMES = 8;
/** The longest side an MP4 can have. */
export const MAX_VIDEO_SIDE = 3840;

/** True when this browser can encode video. */
export function canEncodeVideo(): boolean {
  return typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
}

async function pickCodec(width: number, height: number): Promise<VideoEncoderConfig> {
  for (const codec of AVC_CODECS) {
    const config: VideoEncoderConfig = {
      codec,
      width,
      height,
      bitrate: Math.min(20_000_000, width * height * 8),
      framerate: GIF_FPS,
    };
    const { supported } = await VideoEncoder.isConfigSupported(config);
    if (supported) return config;
  }
  throw new AnimationError(
    'This browser cannot make an MP4 of this size. Use a smaller width, less code, or GIF.',
  );
}

export async function encodeMp4(options: FrameSource): Promise<Blob> {
  if (!canEncodeVideo()) throw new AnimationError('This browser cannot make an MP4. Use GIF.');
  const { width, height } = options.full;
  if (Math.max(width, height) > MAX_VIDEO_SIDE) {
    throw new AnimationError(
      'The image is too large for an MP4. Use a smaller width or less code.',
    );
  }
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer').catch(() => {
    throw new AnimationError('The MP4 maker could not load. Check the connection.');
  });
  const evenW = Math.ceil(width / 2) * 2;
  const evenH = Math.ceil(height / 2) * 2;
  const config = await pickCodec(evenW, evenH);
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: evenW, height: evenH },
    fastStart: 'in-memory',
  });
  let failure: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta): void => muxer.addVideoChunk(chunk, meta),
    error: (error): void => {
      failure = error;
    },
  });
  // Each queued frame holds a full copy of the image, so wait when the encoder falls behind.
  const drain = async (): Promise<void> => {
    while (encoder.encodeQueueSize > MAX_QUEUED_FRAMES && !failure) {
      await new Promise((resolve) => encoder.addEventListener('dequeue', resolve, { once: true }));
    }
  };

  try {
    encoder.configure(config);
    // An MP4 sample lasts until the next one, so a long last frame is sent again at the frame
    // rate until the pause ends.
    const step = options.schedule.delay;
    let timestamp = 0;
    let sent = 0;
    await drawFrames(options, true, async (context, _frame, duration) => {
      for (let at = 0; at < duration; at += step) {
        await drain();
        if (failure) throw failure;
        const video = new VideoFrame(context.canvas, {
          timestamp: timestamp * 1000,
          duration: step * 1000,
        });
        encoder.encode(video, { keyFrame: sent % (GIF_FPS * 3) === 0 });
        video.close();
        timestamp += step;
        sent++;
      }
    });
    await encoder.flush();
    if (failure) throw failure;
  } catch (error) {
    if (error instanceof AnimationError) throw error;
    throw new AnimationError('The MP4 could not be made. Use GIF.');
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
  muxer.finalize();
  return new Blob([muxer.target.buffer], { type: 'video/mp4' });
}
