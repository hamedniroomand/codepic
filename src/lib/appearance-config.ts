export type PaddingPx = 16 | 32 | 64 | 128;
export type WindowStyle = 'minimal' | 'controls' | 'borderless';
export type BackgroundMode = 'solid' | 'gradient' | 'transparent';
export type ExportScale = 1 | 2 | 3;

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
};

export const PADDING_OPTIONS: PaddingPx[] = [16, 32, 64, 128];
export const FONT_SIZE_OPTIONS = [12, 14, 15, 16, 18, 20, 24];
export const EXPORT_SCALE_OPTIONS: ExportScale[] = [1, 2, 3];

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

function parseBackground(raw: unknown): BackgroundConfig {
  const bg = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    mode:
      typeof bg.mode === 'string' && BACKGROUND_MODES.has(bg.mode)
        ? (bg.mode as BackgroundMode)
        : DEFAULT_APPEARANCE.background.mode,
    presetId:
      typeof bg.presetId === 'string' ? bg.presetId : DEFAULT_APPEARANCE.background.presetId,
    solidColor: typeof bg.solidColor === 'string' ? bg.solidColor : null,
    gradientFrom: typeof bg.gradientFrom === 'string' ? bg.gradientFrom : null,
    gradientTo: typeof bg.gradientTo === 'string' ? bg.gradientTo : null,
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
  };
}
