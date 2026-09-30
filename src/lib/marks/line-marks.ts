export type MarkKind = 'emphasized' | 'added' | 'removed';
export type LineMarks = Record<MarkKind, number[]>;

export const MARK_KINDS: MarkKind[] = ['emphasized', 'added', 'removed'];

export const NO_MARKS: LineMarks = { emphasized: [], added: [], removed: [] };

export function hasDiffMarks(marks: LineMarks): boolean {
  return marks.added.length > 0 || marks.removed.length > 0;
}

export function markAt(line: number, marks: LineMarks): MarkKind | null {
  return MARK_KINDS.find((kind) => marks[kind].includes(line)) ?? null;
}

export function isDimmed(line: number, marks: LineMarks): boolean {
  return marks.emphasized.length > 0 && !marks.emphasized.includes(line);
}

export function setMark(marks: LineMarks, line: number, kind: MarkKind | null): LineMarks {
  const next = { ...NO_MARKS };
  for (const other of MARK_KINDS) {
    const rest = marks[other].filter((n) => n !== line);
    next[other] = other === kind ? [...rest, line].sort((a, b) => a - b) : rest;
  }
  return next;
}

/** Clicking a line steps through: none, emphasized, added, removed, none. */
export function cycleMark(marks: LineMarks, line: number): LineMarks {
  const current = markAt(line, marks);
  const next =
    current === null ? MARK_KINDS[0] : (MARK_KINDS[MARK_KINDS.indexOf(current) + 1] ?? null);
  return setMark(marks, line, next);
}

function parseLines(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((n): n is number => Number.isInteger(n) && n > 0);
}

export function parseMarks(raw: unknown): LineMarks {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    emphasized: parseLines(source.emphasized),
    added: parseLines(source.added),
    removed: parseLines(source.removed),
  };
}
