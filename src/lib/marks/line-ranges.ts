const MAX_LINE = 10_000;

export function parseLineRanges(input: string): number[] {
  const lines = new Set<number>();
  for (const token of input.split(',')) {
    const bounds = token.split('-');
    if (bounds.length > 2) continue;
    const from = Number(bounds[0]);
    const to = Number(bounds.at(-1));
    if (!Number.isInteger(from) || !Number.isInteger(to)) continue;
    if (from < 1 || to < from || to > MAX_LINE) continue;
    for (let line = from; line <= to; line++) lines.add(line);
  }
  return [...lines].sort((a, b) => a - b);
}

export function formatLineRanges(lines: number[]): string {
  const sorted = [...new Set(lines)].sort((a, b) => a - b);
  const ranges: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (sorted[i + 1] === sorted[i] + 1) i++;
    ranges.push(start === sorted[i] ? `${start}` : `${start}-${sorted[i]}`);
  }
  return ranges.join(',');
}
