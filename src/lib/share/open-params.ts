import {
  EXPORT_FORMATS,
  EXPORT_SCALE_OPTIONS,
  FONT_SIZE_OPTIONS,
  MAX_WIDTH,
  MIN_WIDTH,
  PADDING_OPTIONS,
  type AppearanceConfig,
  type ExportScale,
  type PaddingPx,
  type WindowStyle,
} from '$lib/config/appearance-config';
import { BACKGROUND_PRESETS } from '$lib/config/backgrounds';
import { LANGUAGES } from '$lib/config/languages';
import { THEMES } from '$lib/config/themes';
import { NO_MARKS, type LineMarks } from '$lib/marks/line-marks';
import { parseLineRanges } from '$lib/marks/line-ranges';

export const MAX_CODE_PARAM_CHARS = 8_000;
const MAX_TITLE_CHARS = 200;
const WINDOW_STYLES: WindowStyle[] = ['controls', 'minimal', 'borderless'];

export type OpenParams = {
  appearance: Partial<AppearanceConfig>;
  code?: string;
  marks?: LineMarks;
  /** One readable message per parameter that was ignored. */
  errors: string[];
};

type Apply = (raw: string, result: OpenParams) => void;

function oneOf<T extends string | number>(name: string, allowed: readonly T[], raw: string): T {
  const match = allowed.find((option) => String(option) === raw);
  if (match === undefined) {
    throw new Error(`Unknown ${name} "${raw}". Use one of: ${allowed.join(', ')}.`);
  }
  return match;
}

function boolean(name: string, raw: string): boolean {
  return oneOf(name, ['true', 'false', '1', '0'], raw) === 'true' || raw === '1';
}

function numberBetween(name: string, min: number, max: number, raw: string): number {
  const value = Number(raw);
  if (raw.trim() === '' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`Invalid ${name} "${raw}". Use a number from ${min} to ${max}.`);
  }
  return value;
}

function background(raw: string): AppearanceConfig['background'] {
  const empty = { solidColor: null, gradientFrom: null, gradientTo: null };
  if (raw === 'transparent') return { mode: 'transparent', presetId: '', ...empty };
  const preset = BACKGROUND_PRESETS.find((option) => option.id === raw);
  if (!preset) {
    const allowed = ['transparent', ...BACKGROUND_PRESETS.map((option) => option.id)];
    throw new Error(`Unknown bg "${raw}". Use one of: ${allowed.join(', ')}.`);
  }
  return { mode: preset.mode, presetId: preset.id, ...empty };
}

function marks(kind: keyof LineMarks): Apply {
  return (raw, result) => {
    result.marks = { ...NO_MARKS, ...result.marks, [kind]: parseLineRanges(raw) };
  };
}

const APPLY: Record<string, Apply> = {
  code(raw, result) {
    if (raw.length > MAX_CODE_PARAM_CHARS) {
      throw new Error(
        `The code parameter is over ${MAX_CODE_PARAM_CHARS.toLocaleString()} characters. Use a share link instead.`,
      );
    }
    result.code = raw;
  },
  lang: (raw, { appearance }) => {
    appearance.language = oneOf(
      'lang',
      LANGUAGES.map((l) => l.id),
      raw,
    );
  },
  theme: (raw, { appearance }) => {
    appearance.themeId = oneOf(
      'theme',
      THEMES.map((t) => t.id),
      raw,
    );
  },
  bg: (raw, { appearance }) => {
    appearance.background = background(raw);
  },
  padding: (raw, { appearance }) => {
    appearance.paddingPx = oneOf('padding', PADDING_OPTIONS, raw) as PaddingPx;
  },
  width: (raw, { appearance }) => {
    appearance.width = Math.round(numberBetween('width', MIN_WIDTH, MAX_WIDTH, raw));
  },
  font: (raw, { appearance }) => {
    appearance.fontSize = oneOf('font', FONT_SIZE_OPTIONS, raw);
  },
  lh: (raw, { appearance }) => {
    appearance.lineHeight = numberBetween('lh', 1.2, 2, raw);
  },
  window: (raw, { appearance }) => {
    appearance.windowStyle = oneOf('window', WINDOW_STYLES, raw);
  },
  lines: (raw, { appearance }) => {
    appearance.lineNumbers = boolean('lines', raw);
  },
  wrap: (raw, { appearance }) => {
    appearance.wrap = boolean('wrap', raw);
  },
  showTitle: (raw, { appearance }) => {
    appearance.showTitle = boolean('showTitle', raw);
  },
  title: (raw, { appearance }) => {
    if (raw.length > MAX_TITLE_CHARS)
      throw new Error(`The title is over ${MAX_TITLE_CHARS} characters.`);
    appearance.title = raw;
  },
  scale: (raw, { appearance }) => {
    appearance.exportScale = oneOf('scale', EXPORT_SCALE_OPTIONS, raw) as ExportScale;
  },
  format: (raw, { appearance }) => {
    appearance.exportFormat = oneOf('format', EXPORT_FORMATS, raw);
  },
  highlight: marks('emphasized'),
  added: marks('added'),
  removed: marks('removed'),
};

/** Parameters the command line accepts as options, with the same names and allowed values. */
export const APPEARANCE_PARAMS = Object.keys(APPLY).filter((name) => name !== 'code');

/** Reads `?theme=nord&code=…`. Unknown names are ignored and bad values are reported, never applied. */
export function parseOpenParams(search: string): OpenParams {
  const result: OpenParams = { appearance: {}, errors: [] };
  for (const [name, raw] of new URLSearchParams(search)) {
    if (!Object.hasOwn(APPLY, name)) continue;
    try {
      APPLY[name](raw, result);
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return result;
}
