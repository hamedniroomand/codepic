import { domToBlob, domToForeignObjectSvg } from 'modern-screenshot';

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
