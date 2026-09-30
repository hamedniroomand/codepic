import type { AppearanceConfig } from '$lib/config/appearance-config';
import { themeById } from '$lib/config/themes';
import { escapePlain } from '$lib/highlight/highlighter';
import {
  hasDiffMarks,
  isDimmed,
  markAt,
  type LineMarks,
  type MarkKind,
} from '$lib/marks/line-marks';

import { backgroundPaint } from './background';
import { tokenize } from './tokenize';
import { wrapTokens, type Token } from './wrap';

// Measurements mirror CodeWindow so the image matches what the app exports.
const CHAR_WIDTH = 0.6; // JetBrains Mono advance, in em
const ASCENT = 1.02;
const CONTENT_HEIGHT = 1.32; // ascent + descent, in em
const RADIUS = 18;
const TITLE_BAR = 54;
const MARGIN = { top: 8, side: 24, bottom: 24 };
const TINT_BLEED = 8;
const MARK_COLORS = { added: '#3fb950', removed: '#f85149' };
const SIGNS = { added: '+', removed: '−' };

const FONT = 'font-family="JetBrains Mono, monospace"';

// ponytail: width is counted in characters, so wide glyphs (CJK, emoji) can overrun a row.
// Upgrade path: measure with a font shaper such as opentype.js.
export async function renderSvg(
  code: string,
  appearance: AppearanceConfig,
  marks: LineMarks,
): Promise<string> {
  const theme = themeById(appearance.themeId);
  const size = appearance.fontSize;
  const cell = size * CHAR_WIDTH;
  const lineHeight = size * appearance.lineHeight;
  const pad = appearance.paddingPx;
  const winW = appearance.width - pad * 2;

  const showDiff = hasDiffMarks(marks);
  const signW = showDiff ? 2 * cell : 0;
  const numberW = appearance.lineNumbers ? 4 * cell : 0;
  const codeW = winW - MARGIN.side * 2 - signW - numberW;
  const columns = appearance.wrap ? Math.max(1, Math.floor(codeW / cell)) : Infinity;

  const lines = await tokenize(
    code.replaceAll('\t', '  '),
    appearance.language,
    appearance.themeId,
  );
  const rows = lines.map((tokens) => wrapTokens(tokens, columns));
  const rowCount = rows.reduce((sum, wrapped) => sum + wrapped.length, 0);

  const titleBar = appearance.showTitle || appearance.windowStyle === 'controls' ? TITLE_BAR : 0;
  const winH = titleBar + MARGIN.top + rowCount * lineHeight + MARGIN.bottom;
  const frameH = winH + pad * 2;
  const borderless = appearance.windowStyle === 'borderless';
  const paint = backgroundPaint(appearance.background, appearance.width, frameH);

  const left = pad + MARGIN.side;
  const codeX = left + signW + numberW;
  const baselineOffset = (lineHeight - CONTENT_HEIGHT * size) / 2 + ASCENT * size;
  let top = pad + titleBar + MARGIN.top;

  const body = rows.map((wrapped, index) => {
    const line = index + 1;
    const mark = markAt(line, marks);
    const height = wrapped.length * lineHeight;
    const baseline = top + baselineOffset;

    const svg = [
      mark
        ? tint(
            mark,
            left - TINT_BLEED,
            top,
            winW - MARGIN.side * 2 + TINT_BLEED * 2,
            height,
            theme.window.title,
          )
        : '',
      showDiff && mark && mark !== 'emphasized' ? sign(mark, left + cell, baseline) : '',
      appearance.lineNumbers
        ? `<text x="${left + signW + numberW - 1.5 * cell}" y="${baseline}" text-anchor="end" fill="${theme.window.muted}">${line}</text>`
        : '',
      ...wrapped.map((row, rowIndex) =>
        rowText(row, codeX, baseline + rowIndex * lineHeight, theme.window.title),
      ),
    ].join('');

    top += height;
    return `<g${isDimmed(line, marks) ? ' opacity="0.4"' : ''}>${svg}</g>`;
  });

  const window = `x="${pad}" y="${pad}" width="${winW}" height="${winH}" rx="${RADIUS}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${appearance.width}" height="${frameH}" viewBox="0 0 ${appearance.width} ${frameH}" font-size="${size}" ${FONT}>
<defs>${paint.defs}<filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dy="24" stdDeviation="28" flood-opacity="0.3"/></filter><clipPath id="code"><rect x="${codeX}" y="${pad}" width="${codeW}" height="${winH}"/></clipPath></defs>
${appearance.background.mode === 'transparent' ? '' : `<rect width="100%" height="100%" fill="${paint.fill}"/>`}
${borderless ? '' : `<rect ${window} fill="${theme.window.bg}" filter="url(#shadow)"/>`}
<rect ${window} fill="${theme.window.bg}" stroke="${borderless ? 'none' : theme.window.border}"/>
${titleBar ? titleBarSvg(appearance, pad, winW, theme.window.title) : ''}
${body.join('\n')}
</svg>
`;
}

function tint(
  mark: MarkKind,
  x: number,
  y: number,
  width: number,
  height: number,
  emphasis: string,
): string {
  const [fill, opacity] = mark === 'emphasized' ? [emphasis, 0.14] : [MARK_COLORS[mark], 0.2];
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" fill-opacity="${opacity}"/>`;
}

function sign(mark: 'added' | 'removed', x: number, y: number): string {
  return `<text x="${x}" y="${y}" text-anchor="middle" fill="${MARK_COLORS[mark]}">${SIGNS[mark]}</text>`;
}

function rowText(row: Token[], x: number, y: number, fallback: string): string {
  const spans = row
    .map(
      (token) => `<tspan fill="${token.color ?? fallback}">${escapePlain(token.content)}</tspan>`,
    )
    .join('');
  return `<text x="${x}" y="${y}" xml:space="preserve" clip-path="url(#code)">${spans}</text>`;
}

function titleBarSvg(
  appearance: AppearanceConfig,
  pad: number,
  winW: number,
  color: string,
): string {
  const dots =
    appearance.windowStyle === 'controls'
      ? [25, 42, 59].map((x) => `<circle cx="${pad + x}" cy="${pad + 27}" r="5" fill="#ffffff30"/>`)
      : [];
  const title = appearance.showTitle
    ? `<text x="${pad + winW / 2}" y="${pad + 31}" text-anchor="middle" font-size="12" fill="${color}">${escapePlain(appearance.title)}</text>`
    : '';
  return dots.join('') + title;
}
