export type CopyResult = { ok: true } | { ok: false; reason: string };

export function canCopyImages(): boolean {
  return typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard?.write === 'function';
}

/**
 * The write must start inside the click, before the capture finishes. Safari drops the
 * user gesture otherwise, so the item takes the pending blob instead of a finished one.
 */
export async function copyImage(blob: Promise<Blob>): Promise<CopyResult> {
  if (!canCopyImages()) {
    return { ok: false, reason: 'This browser cannot copy images. Use Download instead.' };
  }
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'Copying failed. Use Download instead.' };
  }
}
