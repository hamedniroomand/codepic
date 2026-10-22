#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';

import { DEFAULT_APPEARANCE, mergeAppearance } from '$lib/config/appearance-config';
import { codeFontById } from '$lib/config/fonts';
import { detectLanguage } from '$lib/highlight/detect-language';
import { NO_MARKS } from '$lib/marks/line-marks';
import { MAX_PANELS, newPanel, type Panel } from '$lib/panels/panels';
import { parseOpenParams } from '$lib/share/open-params';

import { HELP, parseCliArgs } from './args';
import { renderPanelsSvg } from './render-svg';

function fontFile(name: string): string {
  return fileURLToPath(new URL(`../assets/${name}`, import.meta.url));
}

async function readInput(file: string | undefined): Promise<string> {
  if (file) return readFileSync(file, 'utf8');
  if (process.stdin.isTTY) throw new Error('Pass --file <path> or pipe code on standard input.');
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function run(argv: string[]): Promise<void> {
  const options = parseCliArgs(argv);
  if (options.help) {
    process.stdout.write(`${HELP}\n`);
    return;
  }

  const params = parseOpenParams(options.query);
  if (params.errors.length) throw new Error(params.errors.join('\n'));

  if (options.files.length > MAX_PANELS) {
    throw new Error(`Give --file at most ${MAX_PANELS} times, one panel for each file.`);
  }
  const [first, ...others] = options.files;
  const code = await readInput(first);
  if (!code.trim()) throw new Error(first ? `The file ${first} is empty.` : 'The input is empty.');

  const appearance = mergeAppearance(DEFAULT_APPEARANCE, {
    language: detectLanguage(code),
    title: first ? basename(first) : DEFAULT_APPEARANCE.title,
    exportFormat: extname(options.output ?? '') === '.svg' ? 'svg' : 'png',
    ...params.appearance,
  });
  const output = options.output ?? `codepic.${appearance.exportFormat}`;

  // Marks and annotations from the options belong to the first panel.
  const panels: Panel[] = [
    {
      code,
      language: appearance.language,
      title: appearance.title,
      marks: params.marks ?? NO_MARKS,
      annotations: params.annotations ?? [],
    },
    ...others.map((file) => {
      const text = readFileSync(file, 'utf8');
      if (!text.trim()) throw new Error(`The file ${file} is empty.`);
      return { ...newPanel(detectLanguage(text)), code: text, title: basename(file) };
    }),
  ];
  const svg = await renderPanelsSvg(panels, appearance);
  if (appearance.exportFormat === 'svg') {
    writeFileSync(output, svg);
  } else {
    const font = codeFontById(appearance.codeFont);
    const image = new Resvg(svg, {
      fitTo: { mode: 'zoom', value: appearance.exportScale },
      font: {
        fontFiles: [fontFile(font.file)],
        loadSystemFonts: false,
        defaultFontFamily: font.family,
      },
    });
    writeFileSync(output, image.render().asPng());
  }
  console.error(`Wrote ${output}`);
}

run(process.argv.slice(2)).catch((error: unknown) => {
  console.error(`codepic: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
