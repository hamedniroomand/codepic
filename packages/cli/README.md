# CodePic CLI

Turn code into PNG or SVG images from the command line. Highlighting and layout run locally; nothing is uploaded.

## Install

```sh
npm install -g codepic
```

Or run without installing:

```sh
npx codepic --help
```

Requires Node 22 or newer.

## Usage

```sh
codepic --file app.ts --theme nord -o out.png
cat app.ts | codepic --lang typescript -o out.svg
```

Code comes from `--file` or standard input. Give `--file` up to 3 times for one panel per file. Each extra panel gets its language from its code and its title from its file name. `--lang`, `--title`, `--highlight`, `--added`, `--removed` and `--annotate` apply to the first panel. `-o` / `--output` sets the path (default `codepic.png`). A `.svg` extension writes SVG. The SVG names the code font but does not embed it, so a viewer without that font installed draws another monospace font. PNG output always uses the chosen font. Language is guessed when you omit `--lang`; with `--file`, the filename is used as the title unless you pass `--title`.

```sh
codepic --help
```

## Appearance options

These match the [CodePic web app](https://codepic.kitdev.space/) URL parameters and the same option names on the command line.

| Option           | Values                                                                                                                                                                                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--lang`         | Language id: `javascript`, `typescript`, `jsx`, `tsx`, `html`, `css`, `json`, `shell`, `python`, `go`, `php`, `sql`, `java`, `csharp`, `rust`, `markdown`, `c`, `cpp`, `kotlin`, `swift`, `ruby`, `yaml`, `toml`, `dockerfile`, `svelte`, `vue`, `plaintext`                                                    |
| `--theme`        | `github-light`, `github-dark`, `dracula`, `nord`, `one-dark-pro`, `catppuccin-latte`, `catppuccin-mocha`, `tokyo-night`, `monokai`, `night-owl`, `rose-pine`, `solarized-light`, `solarized-dark`, `vitesse-light`, `vitesse-dark`                                                                              |
| `--bg`           | Background preset (`ocean`, `slate`, `sunset`, `forest`, `paper`, `charcoal`, `violet`, `rose`), `transparent`, a 6-digit hex color without `#` (`ff8800`), or two hex colors for a gradient (`ff8800,3355ff`)                                                                                                  |
| `--padding`      | `16`, `32`, `64`, `128`                                                                                                                                                                                                                                                                                         |
| `--aspect`       | `free` (default), `16:9`, `1:1` or `4:5`                                                                                                                                                                                                                                                                        |
| `--width`        | `320`–`1600`                                                                                                                                                                                                                                                                                                    |
| `--font`         | `12`, `14`, `15`, `16`, `18`, `20`, `24`                                                                                                                                                                                                                                                                        |
| `--codeFont`     | `jetbrains-mono` (default), `fira-code`, `source-code-pro` or `ibm-plex-mono`                                                                                                                                                                                                                                   |
| `--ligatures`    | `true` (default) or `false`                                                                                                                                                                                                                                                                                     |
| `--lh`           | Line height, `1.2`–`2`                                                                                                                                                                                                                                                                                          |
| `--window`       | `controls`, `minimal`, `borderless`                                                                                                                                                                                                                                                                             |
| `--lines`        | Line numbers: `true` or `false`                                                                                                                                                                                                                                                                                 |
| `--wrap`         | Wrap long lines: `true` or `false`                                                                                                                                                                                                                                                                              |
| `--showTitle`    | Show filename: `true` or `false`                                                                                                                                                                                                                                                                                |
| `--title`        | Window title (up to 200 characters)                                                                                                                                                                                                                                                                             |
| `--scale`        | PNG scale: `1`, `2`, `3`                                                                                                                                                                                                                                                                                        |
| `--format`       | `png` or `svg`. Animated GIFs need the web app                                                                                                                                                                                                                                                                  |
| `--signature`    | Short text in a corner, such as `@yourname`. Up to 60 characters. Off by default. Longer text is an error                                                                                                                                                                                                       |
| `--signaturePos` | `bottom-right`, `bottom-left`, `top-right` or `top-left` (default `bottom-right`)                                                                                                                                                                                                                               |
| `--annotate`     | `LINE`, then optional `:FROM-TO` columns (from 1), optional `:box` or `:underline` (default `box`), and an optional `:NOTE` of up to 80 characters that can contain `:`. Without columns, the whole line is marked. Example: `3:5-12:box:Reads the file`. Give it more than once for more annotations, up to 50 |
| `--panelLayout`  | `row` (default, side by side) or `column` (stacked), for more than one `--file`                                                                                                                                                                                                                                 |
| `--highlight`    | Lines to emphasize, e.g. `2,5-7`                                                                                                                                                                                                                                                                                |
| `--added`        | Lines marked as added                                                                                                                                                                                                                                                                                           |
| `--removed`      | Lines marked as removed                                                                                                                                                                                                                                                                                         |

Invalid values print a clear error and exit with status 1.

## Notes

Images use the same highlighter, themes, and layout as the browser app. The drop shadow is approximated, and wrapping is by character count, so wide characters (CJK, emoji) may extend past a row.

## Links

- [CodePic app](https://codepic.kitdev.space/)
- [Repository](https://github.com/hamedniroomand/codepic)
- [Issues](https://github.com/hamedniroomand/codepic/issues)

## License

MIT
