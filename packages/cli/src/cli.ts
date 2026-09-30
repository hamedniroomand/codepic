#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';

import { DEFAULT_APPEARANCE, mergeAppearance } from '$lib/config/appearance-config';
import { detectLanguage } from '$lib/highlight/detect-language';
import { NO_MARKS } from '$lib/marks/line-marks';
import { parseOpenParams } from '$lib/share/open-params';

import { HELP, parseCliArgs } from './args';
import { renderSvg } from './render-svg';

const FONT_FILE = fileURLToPath(new URL('../assets/JetBrainsMono-Regular.ttf', import.meta.url));

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

  const code = await readInput(options.file);
  if (!code.trim()) throw new Error('The input is empty.');

  const appearance = mergeAppearance(DEFAULT_APPEARANCE, {
    language: detectLanguage(code),
    title: options.file ? basename(options.file) : DEFAULT_APPEARANCE.title,
    exportFormat: extname(options.output ?? '') === '.svg' ? 'svg' : 'png',
    ...params.appearance,
  });
  const output = options.output ?? `codepic.${appearance.exportFormat}`;

  const svg = await renderSvg(code, appearance, params.marks ?? NO_MARKS);
  if (appearance.exportFormat === 'svg') {
    writeFileSync(output, svg);
  } else {
    const image = new Resvg(svg, {
      fitTo: { mode: 'zoom', value: appearance.exportScale },
      font: { fontFiles: [FONT_FILE], loadSystemFonts: false, defaultFontFamily: 'JetBrains Mono' },
    });
    writeFileSync(output, image.render().asPng());
  }
  console.error(`Wrote ${output}`);
}

run(process.argv.slice(2)).catch((error: unknown) => {
  console.error(`codepic: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
