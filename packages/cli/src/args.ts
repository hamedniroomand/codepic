import { parseArgs } from 'node:util';

import { APPEARANCE_PARAMS } from '$lib/share/open-params';

// `annotate` can be given more than once, one annotation each time.
const APPEARANCE_OPTIONS = Object.fromEntries(
  APPEARANCE_PARAMS.map(
    (name) => [name, { type: 'string', multiple: name === 'annotate' }] as const,
  ),
);

export type CliOptions = {
  /** One file for each panel, in order. */
  files: string[];
  output?: string;
  help: boolean;
  /** Appearance options as a query string, in the form the app reads from a URL. */
  query: string;
};

export const HELP = `Usage: codepic [--file <path>]... [-o <path>] [options]

Turns code into a PNG or SVG image. Code comes from --file, or from standard input.
Nothing is uploaded: highlighting and drawing both run on this machine.

  -f, --file <path>     Read code from a file. Give it up to 3 times, one
                        panel for each file
  -o, --output <path>   Write the image here (default codepic.png; .svg writes SVG)
  -h, --help            Show this help

Appearance options take the same values as the URL parameters in the README.
--lang, --title, --highlight, --added, --removed and --annotate apply to the
first panel:

  --lang <id>           Language (default: guessed from the code): javascript,
                        typescript, jsx, tsx, html, css, json, shell, python,
                        go, php, sql, java, csharp, rust, markdown, c, cpp,
                        kotlin, swift, ruby, yaml, toml, dockerfile, svelte,
                        vue, plaintext
  --theme <id>          github-light, github-dark, dracula, nord, one-dark-pro,
                        catppuccin-latte, catppuccin-mocha, tokyo-night,
                        monokai, night-owl, rose-pine, solarized-light,
                        solarized-dark, vitesse-light, vitesse-dark
  --bg <id>             A background preset, transparent, a 6-digit hex color
                        without # (ff8800), or two colors such as ff8800,3355ff
  --padding <px>        16, 32, 64 or 128
  --aspect <shape>      free (default, the height follows the code), 16:9,
                        1:1 or 4:5 (the card gets smaller to fit)
  --width <px>          320 to 1600
  --font <px>           12, 14, 15, 16, 18, 20 or 24
  --codeFont <id>       jetbrains-mono (default), fira-code, source-code-pro
                        or ibm-plex-mono
  --ligatures <bool>    Join symbols such as => into one glyph (default true)
  --lh <number>         Line height, 1.2 to 2
  --window <style>      controls, minimal or borderless
  --lines <bool>        Line numbers, true or false
  --wrap <bool>         Wrap long lines, true or false
  --showTitle <bool>    Show the filename, true or false
  --title <text>        Filename of the first panel (default: the name of
                        the first --file)
  --scale <n>           PNG scale, 1, 2 or 3
  --format <type>       png or svg (default: from --output)
  --signature <text>    Short text in a corner, up to 60 characters
                        (default: none)
  --signaturePos <pos>  bottom-right (default), bottom-left, top-right
                        or top-left
  --annotate <spec>     Box or underline part of a line. The note is optional:
                        LINE[:FROM-TO][:box|underline][:NOTE], such as
                        3:5-12:box:Reads the file. Without columns, the
                        whole line is marked. Give it up to 50 times.
  --panelLayout <how>   row (default, side by side) or column (stacked)
  --highlight <lines>   Lines to emphasize, such as 2,5-7
  --added <lines>       Lines marked as added
  --removed <lines>     Lines marked as removed

Example:
  npx codepic --file app.ts --theme nord -o out.png
`;

function toQuery(options: Record<string, string | string[]>): string {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(options)) {
    for (const item of Array.isArray(value) ? value : [value]) query.append(name, item);
  }
  return query.toString();
}

export function parseCliArgs(argv: string[]): CliOptions {
  const { values } = parseArgs({
    args: argv,
    options: {
      file: { type: 'string', short: 'f', multiple: true },
      output: { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h' },
      ...APPEARANCE_OPTIONS,
    },
  });
  const { file, output, help, ...appearance } = values;
  return {
    files: file ?? [],
    output,
    help: help ?? false,
    query: toQuery(appearance as Record<string, string | string[]>),
  };
}
