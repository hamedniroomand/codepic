import { domToBlob, domToCanvas, domToForeignObjectSvg } from 'modern-screenshot';

import type { ExportFormat } from '$lib/config/appearance-config';

type CaptureOptions = { format: ExportFormat; scale: number; transparent: boolean };

async function captureSvg(node: HTMLElement, backgroundColor: null | undefined): Promise<Blob> {
  const svg = await domToForeignObjectSvg(node, { backgroundColor });
  const markup = new XMLSerializer().serializeToString(svg);
  return new Blob([markup], { type: 'image/svg+xml' });
}

export function captureImage(node: HTMLElement, options: CaptureOptions): Promise<Blob> {
  const backgroundColor = options.transparent ? null : undefined;
  return options.format === 'svg'
    ? captureSvg(node, backgroundColor)
    : domToBlob(node, { scale: options.scale, backgroundColor });
}

/**
 * Draws the snapshot on a canvas for an animation. With `hideCode`, the code text is hidden.
 * Line highlights and annotation boxes stay, so only the text appears as it types.
 */
export async function captureCanvas(
  node: HTMLElement,
  hideCode: boolean,
): Promise<HTMLCanvasElement> {
  // The capture copies computed styles, so the style must change on the node itself.
  // SnapshotFrame styles `data-hide-code`.
  if (hideCode) node.setAttribute('data-hide-code', '');
  try {
    // GIF and MP4 have no partial transparency, so a see-through background becomes white.
    return await domToCanvas(node, { scale: 1, backgroundColor: '#ffffff' });
  } finally {
    node.removeAttribute('data-hide-code');
  }
}
