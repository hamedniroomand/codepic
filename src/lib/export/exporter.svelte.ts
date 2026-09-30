import { tick } from 'svelte';

import type { AppearanceConfig, ExportFormat } from '$lib/appearance-config';

import { captureImage } from './capture';
import { copyImage } from './clipboard';
import { downloadBlob, filenameFor } from './download';

export type ExportAction = 'download' | 'copy';

export type Exporter = {
  /** True while a capture is running. Actions stay disabled until it clears. */
  readonly busy: boolean;
  /** Which action is running, so only that button shows a spinner. */
  readonly pending: ExportAction | null;
  run: (action: ExportAction) => Promise<void>;
};

type Source = () => {
  node: HTMLElement | null;
  appearance: AppearanceConfig;
  highlightSettled: Promise<void>;
};

/**
 * A capture is fast enough to finish as a flicker. Hold the spinner briefly so the
 * action reads as work that happened rather than a button that twitched.
 */
const MIN_BUSY_MS = 400;

export function createExporter(source: Source, onStatus: (message: string) => void): Exporter {
  let pending = $state<ExportAction | null>(null);

  async function run(action: ExportAction): Promise<void> {
    const { node, appearance, highlightSettled } = source();
    if (!node || pending) return;
    pending = action;
    const startedAt = performance.now();

    const capture = async (format: ExportFormat): Promise<Blob> => {
      // The export node must be painted and fully styled before it is captured.
      await tick();
      await highlightSettled;
      await document.fonts.ready;
      await tick();
      return captureImage(node, {
        format,
        scale: appearance.exportScale,
        transparent: appearance.background.mode === 'transparent',
      });
    };

    try {
      if (action === 'copy') {
        const result = await copyImage(capture('png'));
        onStatus(result.ok ? 'Image copied to clipboard.' : result.reason);
        return;
      }
      const { exportFormat, title } = appearance;
      downloadBlob(await capture(exportFormat), filenameFor(title, exportFormat));
      onStatus('Download started.');
    } catch {
      onStatus('Export failed. Try again.');
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
    get pending(): ExportAction | null {
      return pending;
    },
    run,
  };
}
