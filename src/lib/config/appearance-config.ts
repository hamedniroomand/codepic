import { CODE_FONTS } from '$lib/config/fonts';

export type PaddingPx = 16 | 32 | 64 | 128;
export type WindowStyle = 'minimal' | 'controls' | 'borderless';
export type BackgroundMode = 'solid' | 'gradient' | 'transparent';
export type ExportScale = 1 | 2 | 3;
export type ExportFormat = 'png' | 'svg';
export type AspectRatio = 'free' | '16:9' | '1:1' | '4:5';
export type SignaturePosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export type BackgroundConfig = {
  mode: BackgroundMode;
  presetId: string;
  solidColor?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
};

export type AppearanceConfig = {
  language: string;
  themeId: string;
  background: BackgroundConfig;
  paddingPx: PaddingPx;
  width: number;
  lineNumbers: boolean;
  wrap: boolean;
  fontSize: number;
  lineHeight: number;
  windowStyle: WindowStyle;
  showTitle: boolean;
  title: string;
  exportScale: ExportScale;
  exportFormat: ExportFormat;
  /** A fixed image shape, or `free` to fit the height to the code. */
  aspect: AspectRatio;
  /** An id from CODE_FONTS. */
  codeFont: string;
  ligatures: boolean;
  /** Short text in a corner of the image. Empty means no signature. */
  signature: string;
  signaturePosition: SignaturePosition;
};

export const PADDING_OPTIONS: PaddingPx[] = [16, 32, 64, 128];
export const FONT_SIZE_OPTIONS = [12, 14, 15, 16, 18, 20, 24];
export const EXPORT_SCALE_OPTIONS: ExportScale[] = [1, 2, 3];
export const EXPORT_FORMATS: ExportFormat[] = ['png', 'svg'];
export const SIGNATURE_POSITIONS: SignaturePosition[] = [
  'bottom-right',
  'bottom-left',
  'top-right',
  'top-left',
];
export const MAX_SIGNATURE_CHARS = 60;
export const ASPECT_RATIOS: AspectRatio[] = ['free', '16:9', '1:1', '4:5'];

/** Code drawn smaller than this, in px, is hard to read. */
export const MIN_READABLE_FONT_PX = 9;

/** Image height for a fixed shape, or null when the height follows the code. */
export function aspectHeight(aspect: AspectRatio, width: number): number | null {
  if (aspect === 'free') return null;
  const [w, h] = aspect.split(':').map(Number);
  return Math.round((width * h) / w);
}

/**
 * Padding above and below the card in a fixed shape. It never takes more than half of the
 * height, so a small shape with large padding still has room for the card.
 */
export function verticalPadding(frameHeight: number, padding: number): number {
  return Math.min(padding, frameHeight / 4);
}

/** How much the card must shrink so it fits inside the padding of a fixed shape. */
export function fitScale(frameHeight: number, padding: number, cardHeight: number): number {
  const room = frameHeight - verticalPadding(frameHeight, padding) * 2;
  return cardHeight > 0 ? Math.min(1, room / cardHeight) : 1;
}

const graphemes = new Intl.Segmenter();

/** Counts what a reader sees as one character, so an emoji is never split. */
export function characters(raw: string): string[] {
  return Array.from(graphemes.segment(raw), (part) => part.segment);
}

export function cleanSignature(raw: string): string {
  return cleanText(raw, MAX_SIGNATURE_CHARS);
}

/**
 * Removes control characters, which are not valid in SVG text, and cuts the text to `max`
 * characters without splitting an emoji in two.
 */
export function cleanText(raw: string, max: number): string {
  // eslint-disable-next-line no-control-regex
  return characters(raw.replace(/[\u0000-\u001f\u007f-\u009f]/g, ''))
    .slice(0, max)
    .join('');
}

export const MIN_WIDTH = 320;
export const MAX_WIDTH = 1600;

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  language: 'typescript',
  themeId: 'github-dark',
  background: {
    mode: 'gradient',
    presetId: 'ocean',
    solidColor: null,
    gradientFrom: null,
    gradientTo: null,
  },
  paddingPx: 64,
  width: 680,
  lineNumbers: true,
  wrap: true,
  fontSize: 15,
  lineHeight: 1.55,
  windowStyle: 'controls',
  showTitle: true,
  title: 'hello.ts',
  exportScale: 2,
  exportFormat: 'png',
  aspect: 'free',
  codeFont: 'jetbrains-mono',
  ligatures: true,
  signature: '',
  signaturePosition: 'bottom-right',
};

export function clampWidth(value: number): number {
  return Math.round(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, value)));
}

export function mergeAppearance(
  base: AppearanceConfig,
  patch: Partial<AppearanceConfig>,
): AppearanceConfig {
  const next: AppearanceConfig = { ...base, ...patch };
  if (patch.background) {
    next.background = { ...base.background, ...patch.background };
  }
  return next;
}

export function backgroundEnabled(config: AppearanceConfig): boolean {
  return config.background.mode !== 'transparent';
}

const WINDOW_STYLES = new Set<string>(['minimal', 'controls', 'borderless']);
const BACKGROUND_MODES = new Set<string>(['solid', 'gradient', 'transparent']);

// Superseded by paddingPx. Kept so stored and shared configs still resolve.
const LEGACY_PADDING_PX: Record<string, PaddingPx> = {
  none: 16,
  small: 16,
  medium: 32,
  large: 64,
  xlarge: 64,
};

// Superseded by a plain width in px. Kept so stored and shared configs still resolve.
const LEGACY_WIDTH_PX: Record<string, number> = {
  compact: 480,
  standard: 680,
  wide: 900,
};

function parsePaddingPx(raw: Record<string, unknown>): PaddingPx {
  const px = raw.paddingPx;
  if (typeof px === 'number' && PADDING_OPTIONS.includes(px as PaddingPx)) {
    return px as PaddingPx;
  }
  if (typeof raw.padding === 'string' && raw.padding in LEGACY_PADDING_PX) {
    return LEGACY_PADDING_PX[raw.padding];
  }
  return DEFAULT_APPEARANCE.paddingPx;
}

function parseWidth(raw: Record<string, unknown>): number {
  if (typeof raw.width === 'number' && Number.isFinite(raw.width)) return clampWidth(raw.width);
  if (typeof raw.width === 'string') {
    if (raw.width in LEGACY_WIDTH_PX) return LEGACY_WIDTH_PX[raw.width];
    if (raw.width === 'custom' && typeof raw.customWidth === 'number') {
      return Number.isFinite(raw.customWidth)
        ? clampWidth(raw.customWidth)
        : DEFAULT_APPEARANCE.width;
    }
  }
  return DEFAULT_APPEARANCE.width;
}

function parseNumber(raw: unknown, min: number, max: number, fallback: number): number {
  return typeof raw === 'number' && Number.isFinite(raw)
    ? Math.max(min, Math.min(max, raw))
    : fallback;
}

function parseBoolean(raw: unknown, fallback: boolean): boolean {
  return typeof raw === 'boolean' ? raw : fallback;
}

function parseExportScale(raw: unknown): ExportScale {
  const n = Number(raw);
  return n === 1 || n === 2 || n === 3 ? n : DEFAULT_APPEARANCE.exportScale;
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Returns the color in `#rrggbb` lower case, or null. Other CSS text is never accepted. */
export function parseHexColor(raw: unknown): string | null {
  return typeof raw === 'string' && HEX_COLOR.test(raw) ? raw.toLowerCase() : null;
}

function parseBackground(raw: unknown): BackgroundConfig {
  const bg = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    mode:
      typeof bg.mode === 'string' && BACKGROUND_MODES.has(bg.mode)
        ? (bg.mode as BackgroundMode)
        : DEFAULT_APPEARANCE.background.mode,
    presetId:
      typeof bg.presetId === 'string' ? bg.presetId : DEFAULT_APPEARANCE.background.presetId,
    solidColor: parseHexColor(bg.solidColor),
    gradientFrom: parseHexColor(bg.gradientFrom),
    gradientTo: parseHexColor(bg.gradientTo),
  };
}

export function parseAppearance(raw: unknown): AppearanceConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_APPEARANCE };
  const o = raw as Record<string, unknown>;

  return {
    language: typeof o.language === 'string' ? o.language : DEFAULT_APPEARANCE.language,
    themeId: typeof o.themeId === 'string' ? o.themeId : DEFAULT_APPEARANCE.themeId,
    background: parseBackground(o.background),
    paddingPx: parsePaddingPx(o),
    width: parseWidth(o),
    lineNumbers: parseBoolean(o.lineNumbers, DEFAULT_APPEARANCE.lineNumbers),
    wrap: parseBoolean(o.wrap, DEFAULT_APPEARANCE.wrap),
    fontSize: parseNumber(o.fontSize, 12, 24, DEFAULT_APPEARANCE.fontSize),
    lineHeight: parseNumber(o.lineHeight, 1.2, 2, DEFAULT_APPEARANCE.lineHeight),
    windowStyle:
      typeof o.windowStyle === 'string' && WINDOW_STYLES.has(o.windowStyle)
        ? (o.windowStyle as WindowStyle)
        : DEFAULT_APPEARANCE.windowStyle,
    showTitle: parseBoolean(o.showTitle, DEFAULT_APPEARANCE.showTitle),
    title: typeof o.title === 'string' ? o.title : DEFAULT_APPEARANCE.title,
    exportScale: parseExportScale(o.exportScale),
    exportFormat: EXPORT_FORMATS.find((format) => format === o.exportFormat) ?? 'png',
    aspect: ASPECT_RATIOS.find((ratio) => ratio === o.aspect) ?? DEFAULT_APPEARANCE.aspect,
    codeFont: CODE_FONTS.some((font) => font.id === o.codeFont)
      ? (o.codeFont as string)
      : DEFAULT_APPEARANCE.codeFont,
    ligatures: parseBoolean(o.ligatures, DEFAULT_APPEARANCE.ligatures),
    signature: typeof o.signature === 'string' ? cleanSignature(o.signature) : '',
    signaturePosition:
      SIGNATURE_POSITIONS.find((position) => position === o.signaturePosition) ??
      DEFAULT_APPEARANCE.signaturePosition,
  };
}
