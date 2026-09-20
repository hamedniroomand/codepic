import { domToPng } from 'modern-screenshot';

type CaptureOpts = { scale: number; transparent: boolean };

export async function captureSnapshot(node: HTMLElement, opts: CaptureOpts): Promise<string> {
  const scale = opts.scale || 2;
  return domToPng(node, {
    scale,
    backgroundColor: opts.transparent ? null : undefined,
  });
}

export function downloadPng(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export async function copyImageBlob(
  blob: Blob,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!navigator.clipboard?.write) {
    return { ok: false, reason: 'Clipboard API is not available in this browser.' };
  }
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'Clipboard access was denied. Use Download instead.' };
  }
}

export async function copyPngDataUrl(
  dataUrl: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return copyImageBlob(blob);
}
