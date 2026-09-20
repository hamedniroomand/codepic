import { tick } from 'svelte';

import type { AppearanceConfig } from '$lib/appearance-config';
import { captureSnapshot, copyPngDataUrl, downloadPng } from '$lib/export-snapshot';

export type ExportFormat = 'download' | 'copy';

export type Exporter = {
  /** True while a capture is running. Actions stay disabled until it clears. */
  readonly busy: boolean;
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

export function createExporter(source: Source, onStatus: (message: string) => void): Exporter {
  let busy = $state(false);

  async function run(format: ExportFormat): Promise<void> {
    const { node, appearance, highlightSettled } = source();
    if (!node || busy) return;
    busy = true;
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
      busy = false;
    }
  }

  return {
    get busy(): boolean {
      return busy;
    },
    run,
  };
}
