export type CodeFontDef = {
  id: string;
  label: string;
  family: string;
  /** Font file for the command line tool, in packages/cli/assets. */
  file: string;
  /** Glyph advance, ascent and descent, in em. The CLI lays out text with these. */
  metrics: { advance: number; ascent: number; descent: number };
};

export const CODE_FONTS: CodeFontDef[] = [
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    family: 'JetBrains Mono',
    file: 'JetBrainsMono-Regular.ttf',
    metrics: { advance: 0.6, ascent: 1.02, descent: 0.3 },
  },
  {
    id: 'fira-code',
    label: 'Fira Code',
    family: 'Fira Code',
    file: 'FiraCode-Regular.ttf',
    metrics: { advance: 1200 / 1950, ascent: 1800 / 1950, descent: 600 / 1950 },
  },
  {
    id: 'source-code-pro',
    label: 'Source Code Pro',
    family: 'Source Code Pro',
    file: 'SourceCodePro-Regular.ttf',
    metrics: { advance: 0.6, ascent: 0.984, descent: 0.273 },
  },
  {
    id: 'ibm-plex-mono',
    label: 'IBM Plex Mono',
    family: 'IBM Plex Mono',
    file: 'IBMPlexMono-Regular.ttf',
    metrics: { advance: 0.6, ascent: 1.025, descent: 0.275 },
  },
];

export function codeFontById(id: string): CodeFontDef {
  return CODE_FONTS.find((font) => font.id === id) ?? CODE_FONTS[0];
}

/** The CSS font stack for a code font. */
export function codeFontStack(id: string): string {
  return `'${codeFontById(id).family}', monospace`;
}
