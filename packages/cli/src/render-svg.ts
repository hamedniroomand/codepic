import { aspectHeight, fitScale, type AppearanceConfig } from '$lib/config/appearance-config';
import { signatureColor } from '$lib/config/backgrounds';
import { codeFontById } from '$lib/config/fonts';
import { themeById } from '$lib/config/themes';
import { escapePlain } from '$lib/highlight/highlighter';
import { noteNumbers, type Annotation } from '$lib/marks/annotations';
import {
  hasDiffMarks,
  isDimmed,
  markAt,
  type LineMarks,
  type MarkKind,
} from '$lib/marks/line-marks';
import { PANEL_GAP, type Panel } from '$lib/panels/panels';

import { backgroundPaint } from './background';
import { tokenize } from './tokenize';
import { wrapTokens, type Token } from './wrap';

// Measurements mirror CodeWindow so the image matches what the app exports.
const RADIUS = 18;
const TITLE_BAR = 54;
const MARGIN = { top: 8, side: 24, bottom: 24 };
const TINT_BLEED = 8;
const MARK_COLORS = { added: '#3fb950', removed: '#f85149' };
const SIGNS = { added: '+', removed: '−' };
const BADGE = 7; // radius of the note number circle, half of its 14px size in CodeWindow

// ponytail: width is counted in characters, so wide glyphs (CJK, emoji) can overrun a row.
// Upgrade path: measure with a font shaper such as opentype.js.
export async function renderSvg(
  code: string,
  appearance: AppearanceConfig,
  marks: LineMarks,
  annotations: Annotation[] = [],
): Promise<string> {
  const { language, title } = appearance;
  return renderPanelsSvg([{ code, language, title, marks, annotations }], appearance);
}

type Window = {
  /** Height that the window needs for its content. */
  height: number;
  /** Draws the window at (0, 0) with the given height. */
  draw: (height: number) => string;
};

/**
 * Draws one window for each panel, side by side or stacked, as SnapshotFrame does. Side by
 * side, every window gets the height of the tallest one, as a flex row stretches them.
 */
export async function renderPanelsSvg(
  panels: Panel[],
  appearance: AppearanceConfig,
): Promise<string> {
  const font = codeFontById(appearance.codeFont);
  const pad = appearance.paddingPx;
  const row = appearance.panelLayout === 'row';
  const inner = appearance.width - pad * 2;
  const winW = row ? (inner - PANEL_GAP * (panels.length - 1)) / panels.length : inner;

  const windows = await Promise.all(
    panels.map((panel, index) => renderWindow(panel, appearance, winW, index)),
  );
  const tallest = Math.max(...windows.map((window) => window.height));
  const cardH = row
    ? tallest
    : windows.reduce((sum, window) => sum + window.height, 0) + PANEL_GAP * (windows.length - 1);
  const fixedH = aspectHeight(appearance.aspect, appearance.width);
  const frameH = fixedH ?? cardH + pad * 2;
  const fit = fixedH === null ? 1 : fitScale(fixedH, pad, cardH);
  const paint = backgroundPaint(appearance.background, appearance.width, frameH);

  let offset = 0;
  const placed = windows.map((window) => {
    const height = row ? tallest : window.height;
    const [x, y] = row ? [pad + offset, pad] : [pad, pad + offset];
    offset += (row ? winW : height) + PANEL_GAP;
    return `<g transform="translate(${x} ${y})">${window.draw(height)}</g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${appearance.width}" height="${frameH}" viewBox="0 0 ${appearance.width} ${frameH}" font-size="${appearance.fontSize}" font-family="${font.family}, monospace"${appearance.ligatures ? '' : ' style="font-variant-ligatures: none"'}>
<defs>${paint.defs}<filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dy="24" stdDeviation="28" flood-opacity="0.3"/></filter></defs>
${appearance.background.mode === 'transparent' ? '' : `<rect width="100%" height="100%" fill="${paint.fill}"/>`}
<g transform="translate(${appearance.width / 2} ${frameH / 2}) scale(${fit}) translate(${-appearance.width / 2} ${-(pad + cardH / 2)})">
${placed.join('\n')}
</g>
${signatureSvg(appearance, frameH)}
</svg>
`;
}

async function renderWindow(
  panel: Panel,
  appearance: AppearanceConfig,
  winW: number,
  index: number,
): Promise<Window> {
  const { code, marks, annotations } = panel;
  const theme = themeById(appearance.themeId);
  const font = codeFontById(appearance.codeFont);
  const size = appearance.fontSize;
  const cell = size * font.metrics.advance;
  const lineHeight = size * appearance.lineHeight;

  const showDiff = hasDiffMarks(marks);
  const signW = showDiff ? 2 * cell : 0;
  const numberW = appearance.lineNumbers ? 4 * cell : 0;
  // A narrow panel can leave no room for code. A negative width is not valid SVG.
  const codeW = Math.max(0, winW - MARGIN.side * 2 - signW - numberW);
  const columns = appearance.wrap ? Math.max(1, Math.floor(codeW / cell)) : Infinity;

  const lines = await tokenize(code.replaceAll('\t', '  '), panel.language, appearance.themeId);
  const rows = lines.map((tokens) => wrapTokens(tokens, columns));
  const rowCount = rows.reduce((sum, wrapped) => sum + wrapped.length, 0);

  const titleBar = appearance.showTitle || appearance.windowStyle === 'controls' ? TITLE_BAR : 0;
  const numbers = noteNumbers(annotations);
  const notes = annotations.filter((annotation) => annotation.note);
  // Mirrors the note list in CodeWindow: 0.85em text, 6px between items, 20px below.
  const noteSize = size * 0.85;
  const noteH = Math.max(BADGE * 2, noteSize * appearance.lineHeight);
  const legendH = notes.length ? notes.length * (6 + noteH) + 20 : 0;
  const contentH = titleBar + MARGIN.top + rowCount * lineHeight + MARGIN.bottom + legendH;
  const borderless = appearance.windowStyle === 'borderless';

  const left = MARGIN.side;
  const codeX = left + signW + numberW;
  const baselineOffset =
    (lineHeight - (font.metrics.ascent + font.metrics.descent) * size) / 2 +
    font.metrics.ascent * size;
  let top = titleBar + MARGIN.top;
  const annotationColor = theme.dark ? '#facc15' : '#d97706';
  const sourceLines = code.split('\n');
  const glyphH = (font.metrics.ascent + font.metrics.descent) * size;
  const clip = `code-${index}`;

  const body = rows.map((wrapped, lineIndex) => {
    const line = lineIndex + 1;
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
      ...annotations
        .filter((annotation) => annotation.line === line)
        .map((annotation) =>
          annotationSvg({
            annotation,
            number: numbers.get(annotation),
            source: sourceLines[lineIndex] ?? '',
            rowWidths: wrapped.map((row) =>
              row.reduce((sum, token) => sum + Array.from(token.content).length, 0),
            ),
            x: codeX,
            top,
            lineHeight,
            contentH: glyphH,
            baseline,
            cell,
            color: annotationColor,
            badgeText: theme.window.bg,
          }),
        ),
      ...wrapped.map((row, rowIndex) =>
        rowText(
          row,
          codeX,
          baseline + rowIndex * lineHeight,
          theme.window.title,
          appearance.ligatures ? null : cell,
          clip,
        ),
      ),
    ].join('');

    top += height;
    return `<g${isDimmed(line, marks) ? ' opacity="0.4"' : ''}>${svg}</g>`;
  });
  const legendTop = top + MARGIN.bottom;

  return {
    height: contentH,
    draw: (winH) => {
      const window = `x="0" y="0" width="${winW}" height="${winH}" rx="${RADIUS}"`;
      return `<clipPath id="${clip}"><rect x="${codeX}" y="0" width="${codeW}" height="${winH}"/></clipPath>
${borderless ? '' : `<rect ${window} fill="${theme.window.bg}" filter="url(#shadow)"/>`}
<rect ${window} fill="${theme.window.bg}" stroke="${borderless ? 'none' : theme.window.border}"/>
${titleBar ? titleBarSvg({ ...appearance, title: panel.title }, 0, winW, theme.window.title) : ''}
${body.join('\n')}
${legendSvg(notes, numbers, left, legendTop, noteH, noteSize, annotationColor, theme.window.bg, theme.window.title)}`;
    },
  };
}

// The app shows a tab as two columns too, the same as tokenize does.
function expand(text: string): string {
  return text.replaceAll('\t', '  ');
}

function badge(cx: number, cy: number, number: number, fill: string, text: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${BADGE}" fill="${fill}"/><text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="700" fill="${text}">${number}</text>`;
}

type AnnotationDraw = {
  annotation: Annotation;
  number: number | undefined;
  /** The line as typed, before tabs are expanded. */
  source: string;
  /** Length of each wrapped row, in code points of the expanded line. */
  rowWidths: number[];
  x: number;
  top: number;
  lineHeight: number;
  contentH: number;
  baseline: number;
  cell: number;
  color: string;
  badgeText: string;
};

/**
 * One box or underline per wrapped row that the range touches. Columns count code points of
 * the line as typed. They are moved to code points of the line with tabs expanded, one cell each.
 */
function annotationSvg(draw: AnnotationDraw): string {
  const { annotation, source, rowWidths, x, cell } = draw;
  const points = Array.from(source);
  const cells = (text: string): number => Array.from(expand(text)).length;
  const total = cells(source);
  const start = annotation.from ? cells(points.slice(0, annotation.from - 1).join('')) : 0;
  const end = annotation.to
    ? Math.min(total, cells(points.slice(0, annotation.to).join('')))
    : total;
  const parts: string[] = [];
  let rowStart = 0;
  let badgeDrawn = false;
  rowWidths.forEach((width, row) => {
    const from = Math.max(start, rowStart);
    const to = Math.min(end, rowStart + width);
    rowStart += width;
    if (to <= from) return;
    const left = x + (from - (rowStart - width)) * cell;
    const span = (to - from) * cell;
    const boxTop = draw.top + row * draw.lineHeight + (draw.lineHeight - draw.contentH) / 2;
    parts.push(
      annotation.kind === 'box'
        ? `<rect x="${left - 0.75}" y="${boxTop - 0.75}" width="${span + 1.5}" height="${draw.contentH + 1.5}" rx="3" fill="none" stroke="${draw.color}" stroke-width="1.5"/>`
        : `<rect x="${left}" y="${draw.baseline + row * draw.lineHeight + 3}" width="${span}" height="2" fill="${draw.color}"/>`,
    );
    if (draw.number && !badgeDrawn) {
      badgeDrawn = true;
      parts.push(badge(left + span + 1, boxTop - 1, draw.number, draw.color, draw.badgeText));
    }
  });
  return parts.join('');
}

function legendSvg(
  notes: Annotation[],
  numbers: Map<Annotation, number>,
  x: number,
  top: number,
  itemH: number,
  fontSize: number,
  color: string,
  badgeText: string,
  textColor: string,
): string {
  return notes
    .map((annotation, index) => {
      const cy = top + index * (6 + itemH) + 6 + itemH / 2;
      const number = numbers.get(annotation) ?? index + 1;
      return `${badge(x + BADGE, cy, number, color, badgeText)}<text x="${x + BADGE * 2 + 8}" y="${cy}" dominant-baseline="central" font-size="${fontSize}" xml:space="preserve" fill="${textColor}">${escapePlain(annotation.note ?? '')}</text>`;
    })
    .join('');
}

function signatureSvg(appearance: AppearanceConfig, frameH: number): string {
  if (!appearance.signature) return '';
  const pad = appearance.paddingPx;
  const [vertical, horizontal] = appearance.signaturePosition.split('-');
  const x = horizontal === 'left' ? pad : appearance.width - pad;
  const y = vertical === 'top' ? pad / 2 : frameH - pad / 2;
  const anchor = horizontal === 'left' ? 'start' : 'end';
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="central" font-size="12" xml:space="preserve" fill="${signatureColor(appearance.background)}">${escapePlain(appearance.signature)}</text>`;
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

/**
 * With ligatures off, each character gets its own x. The PNG renderer ignores
 * font-variant-ligatures, but it never joins glyphs across separate positions.
 */
function rowText(
  row: Token[],
  x: number,
  y: number,
  fallback: string,
  cell: number | null,
  clip: string,
): string {
  let column = 0;
  const spans = row
    .map((token) => {
      const fill = `fill="${token.color ?? fallback}"`;
      if (cell === null) return `<tspan ${fill}>${escapePlain(token.content)}</tspan>`;
      return Array.from(token.content, (char) => {
        const at = x + column++ * cell;
        return `<tspan x="${at}" ${fill}>${escapePlain(char)}</tspan>`;
      }).join('');
    })
    .join('');
  return `<text x="${x}" y="${y}" xml:space="preserve" clip-path="url(#${clip})">${spans}</text>`;
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
