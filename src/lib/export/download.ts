import type { ExportFormat } from '$lib/appearance-config';

export function filenameFor(title: string, format: ExportFormat): string {
  const name = title.trim().replace(/\s+/g, '-') || 'codepic';
  return `${name}.${format}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
