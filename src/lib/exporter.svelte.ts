import { tick } from 'svelte';

import type { AppearanceConfig } from '$lib/appearance-config';
import { captureSnapshot, copyPngDataUrl, downloadPng } from '$lib/export-snapshot';

export type ExportFormat = 'download' | 'copy';

export type Exporter = {
  /** True while a capture is running. Actions stay disabled until it clears. */
  readonly busy: boolean;
  /** Which action is running, so only that button shows a spinner. */
  readonly pending: ExportFormat | null;
  run: (format: ExportFormat) => Promise<void>;
};

type Source = () => {
  node: HTMLElement | null;
  appearance: AppearanceConfig;
  highlightSettled: Promise<void>;
};

function filenameFor(title: string): string {
  const trimmed = title.trim();
  return trimmed ? `${trimmed.replace(/\s+/g, '-')}.png` : 'codepic.png';
}

/**
 * A capture is fast enough to finish as a flicker. Hold the spinner briefly so the
 * action reads as work that happened rather than a button that twitched.
 */
const MIN_BUSY_MS = 400;

export function createExporter(source: Source, onStatus: (message: string) => void): Exporter {
  let pending = $state<ExportFormat | null>(null);

  async function run(format: ExportFormat): Promise<void> {
    const { node, appearance, highlightSettled } = source();
    if (!node || pending) return;
    pending = format;
    const startedAt = performance.now();
    try {
      // The export node must be painted and fully styled before it is captured.
      await tick();
      await highlightSettled;
      await document.fonts.ready;
      await tick();

      const dataUrl = await captureSnapshot(node, {
        scale: appearance.exportScale,
        transparent: appearance.background.mode === 'transparent',
      });

      if (format === 'download') {
        downloadPng(dataUrl, filenameFor(appearance.title));
        onStatus('Download started.');
        return;
      }
      const result = await copyPngDataUrl(dataUrl);
      onStatus(result.ok ? 'Image copied to clipboard.' : result.reason);
    } catch {
      onStatus('Export failed. Try Download again.');
    } finally {
      const remaining = MIN_BUSY_MS - (performance.now() - startedAt);
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      pending = null;
    }
  }

  return {
    get busy(): boolean {
      return pending !== null;
    },
    get pending(): ExportFormat | null {
      return pending;
    },
    run,
  };
}
