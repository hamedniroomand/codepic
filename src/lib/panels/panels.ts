import { cleanText } from '$lib/config/appearance-config';
import { LANGUAGES } from '$lib/config/languages';
import { parseAnnotations, type Annotation } from '$lib/marks/annotations';
import { NO_MARKS, parseMarks, type LineMarks } from '$lib/marks/line-marks';

/** One code window. The first panel keeps its language and filename in the appearance. */
export type Panel = {
  code: string;
  language: string;
  title: string;
  marks: LineMarks;
  annotations: Annotation[];
};

export const MAX_PANELS = 3;
/** Space between panels, in px. The app and the CLI use the same value. */
export const PANEL_GAP = 24;
const MAX_TITLE_CHARS = 200;

export function newPanel(language: string): Panel {
  return { code: '', language, title: '', marks: NO_MARKS, annotations: [] };
}

/** Reads the panels after the first one from a share link. Anything that is not valid is dropped. */
export function parsePanels(raw: unknown): Panel[] {
  if (!Array.isArray(raw)) return [];
  const panels: Panel[] = [];
  for (const item of raw) {
    if (panels.length === MAX_PANELS - 1) break;
    if (!item || typeof item !== 'object') continue;
    const source = item as Record<string, unknown>;
    if (typeof source.c !== 'string') continue;
    panels.push({
      code: source.c,
      language: LANGUAGES.some((language) => language.id === source.l)
        ? (source.l as string)
        : 'plaintext',
      title: typeof source.t === 'string' ? cleanText(source.t, MAX_TITLE_CHARS) : '',
      marks: parseMarks(source.m),
      annotations: parseAnnotations(source.n),
    });
  }
  return panels;
}
