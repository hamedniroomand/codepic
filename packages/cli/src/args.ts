import { parseArgs } from 'node:util';

import { APPEARANCE_PARAMS } from '$lib/share/open-params';

const APPEARANCE_OPTIONS = Object.fromEntries(
  APPEARANCE_PARAMS.map((name) => [name, { type: 'string' }] as const),
);

export type CliOptions = {
  file?: string;
  output?: string;
  help: boolean;
  /** Appearance options as a query string, in the form the app reads from a URL. */
  query: string;
};

export const HELP = `Usage: codepic [--file <path>] [-o <path>] [options]

Turns code into a PNG or SVG image. Code comes from --file, or from standard input.
Nothing is uploaded: highlighting and drawing both run on this machine.

  -f, --file <path>     Read code from a file
  -o, --output <path>   Write the image here (default codepic.png; .svg writes SVG)
  -h, --help            Show this help

Appearance options take the same values as the URL parameters in the README:

  --lang <id>           Language (default: guessed from the code)
  --theme <id>          github-light, github-dark, dracula, nord, one-dark-pro
  --bg <id>             A background preset, or transparent
  --padding <px>        16, 32, 64 or 128
  --width <px>          320 to 1600
  --font <px>           12, 14, 15, 16, 18, 20 or 24
  --lh <number>         Line height, 1.2 to 2
  --window <style>      controls, minimal or borderless
  --lines <bool>        Line numbers, true or false
  --wrap <bool>         Wrap long lines, true or false
  --showTitle <bool>    Show the filename, true or false
  --title <text>        Filename (default: the name of --file)
  --scale <n>           PNG scale, 1, 2 or 3
  --format <type>       png or svg (default: from --output)
  --highlight <lines>   Lines to emphasize, such as 2,5-7
  --added <lines>       Lines marked as added
  --removed <lines>     Lines marked as removed

Example:
  npx codepic --file app.ts --theme nord -o out.png
`;

export function parseCliArgs(argv: string[]): CliOptions {
  const { values } = parseArgs({
    args: argv,
    options: {
      file: { type: 'string', short: 'f' },
      output: { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h' },
      ...APPEARANCE_OPTIONS,
    },
  });
  const { file, output, help, ...appearance } = values;
  return {
    file,
    output,
    help: help ?? false,
    query: new URLSearchParams(appearance as Record<string, string>).toString(),
  };
}
