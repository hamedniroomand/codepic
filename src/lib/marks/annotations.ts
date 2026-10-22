import { cleanText } from '$lib/config/appearance-config';

export type AnnotationKind = 'underline' | 'box';

/**
 * A mark on part of one line. Columns are 1-based and inclusive, in the code as typed.
 * Columns count code points. Without columns the mark covers the whole line.
 */
export type Annotation = {
  line: number;
  from?: number;
  to?: number;
  kind: AnnotationKind;
  note?: string;
};

export const ANNOTATION_KINDS: AnnotationKind[] = ['underline', 'box'];
export const MAX_ANNOTATIONS = 50;
export const MAX_NOTE_CHARS = 80;

function positive(raw: unknown): number | undefined {
  return Number.isInteger(raw) && (raw as number) > 0 ? (raw as number) : undefined;
}

/** Reads annotations from a share link. Anything that is not valid is dropped. */
export function parseAnnotations(raw: unknown): Annotation[] {
  if (!Array.isArray(raw)) return [];
  const result: Annotation[] = [];
  for (const item of raw.slice(0, MAX_ANNOTATIONS)) {
    if (!item || typeof item !== 'object') continue;
    const source = item as Record<string, unknown>;
    const line = positive(source.line);
    const kind = ANNOTATION_KINDS.find((value) => value === source.kind);
    if (!line || !kind) continue;
    const annotation: Annotation = { line, kind };
    const from = positive(source.from);
    const to = positive(source.to);
    if (from && to && from <= to) Object.assign(annotation, { from, to });
    const note = typeof source.note === 'string' ? cleanText(source.note, MAX_NOTE_CHARS) : '';
    if (note) annotation.note = note;
    result.push(annotation);
  }
  return result;
}

/** The number shown next to each annotation that has a note, in list order. */
export function noteNumbers(annotations: Annotation[]): Map<Annotation, number> {
  const numbers = new Map<Annotation, number>();
  for (const annotation of annotations) {
    if (annotation.note) numbers.set(annotation, numbers.size + 1);
  }
  return numbers;
}

function codePoints(text: string): number {
  // Each surrogate pair is two UTF-16 units but one code point.
  return text.length - (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)?.length ?? 0);
}

/** Text position of a selection in the code, as an annotation range on its first line. */
export function rangeFromSelection(
  code: string,
  start: number,
  end: number,
): Pick<Annotation, 'line' | 'from' | 'to'> {
  const before = code.slice(0, start);
  const line = before.split('\n').length;
  const lineStart = before.lastIndexOf('\n') + 1;
  const lineEnd = code.indexOf('\n', start);
  const stop = Math.min(end, lineEnd === -1 ? code.length : lineEnd);
  if (stop <= start) return { line };
  // The textarea gives UTF-16 offsets. Columns count code points, as markColumns does.
  const from = codePoints(code.slice(lineStart, start)) + 1;
  return { line, from, to: from + codePoints(code.slice(start, stop)) - 1 };
}

type Range = { from: number; to: number; kind: AnnotationKind; number?: number };

const TOKEN = /<[^>]*>|&[#\w]+;|[^<&]/gu;

/**
 * Wraps the column ranges of one highlighted line in `<mark>` tags. The line is the HTML that
 * the highlighter made: tags, entities and text. At each range edge the open color spans are
 * closed and opened again, so one `<mark>` holds the whole range and draws one box. Columns
 * count characters as typed, so an entity such as `&lt;` is one column.
 */
export function markColumns(html: string, ranges: Range[]): string {
  if (!ranges.length) return html;
  const stack: string[] = [];
  let column = 0;
  let open: Range | null = null;
  let out = '';
  const closeAll = (): string => stack.map(() => '</span>').join('');
  const reopenAll = (): string => stack.join('');
  const rangeAt = (col: number): Range | null =>
    ranges.find((range) => col >= range.from && col <= range.to) ?? null;

  for (const [token] of html.matchAll(TOKEN)) {
    if (token.startsWith('</')) {
      stack.pop();
      out += token;
      continue;
    }
    if (token.startsWith('<')) {
      if (!token.endsWith('/>')) stack.push(token);
      out += token;
      continue;
    }
    column++;
    const range = rangeAt(column);
    if (range !== open) {
      out += closeAll();
      if (open) out += '</mark>';
      if (range) {
        const number = range.number ? ` data-n="${range.number}"` : '';
        out += `<mark class="ann ann-${range.kind}"${number}>`;
      }
      out += reopenAll();
      open = range;
    }
    out += token;
  }
  if (open) out += `${closeAll()}</mark>${reopenAll()}`;
  return out;
}

/**
 * Reads one `annotate` link parameter: `LINE`, then optional `:FROM-TO` columns, `:box` or
 * `:underline`, and `:note`, in this order. The note is the rest, so it can hold ":".
 * Throws an Error whose message is fit to show the user.
 */
export function parseAnnotationParam(raw: string): Annotation {
  const parts = raw.split(':');
  const first = parts.shift() ?? '';
  const line = Number(first);
  if (!/^\d+$/.test(first) || line < 1) {
    throw new Error(
      `Invalid annotate value "${raw}". Start with a line number, such as 3:5-12:box:Note.`,
    );
  }
  const annotation: Annotation = { line, kind: 'box' };
  const columns = /^(\d+)(?:-(\d+))?$/.exec(parts[0] ?? '');
  if (columns) {
    parts.shift();
    const from = Number(columns[1]);
    const to = Number(columns[2] ?? columns[1]);
    if (from < 1 || to < from) {
      throw new Error(
        `Invalid annotate columns in "${raw}". Columns start at 1, and FROM must not be more than TO.`,
      );
    }
    Object.assign(annotation, { from, to });
  }
  if (!columns && parts[0] === '') parts.shift();
  const kind = ANNOTATION_KINDS.find((value) => value === parts[0]?.toLowerCase());
  if (kind) {
    parts.shift();
    annotation.kind = kind;
  }
  const note = cleanText(parts.join(':'), MAX_NOTE_CHARS);
  if (note) annotation.note = note;
  return annotation;
}
