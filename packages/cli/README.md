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

Code comes from `--file` or standard input. `-o` / `--output` sets the path (default `codepic.png`). A `.svg` extension writes SVG. Language is guessed when you omit `--lang`; with `--file`, the filename is used as the title unless you pass `--title`.

```sh
codepic --help
```

## Appearance options

These match the [CodePic web app](https://codepic.kitdev.space/) URL parameters and the same option names on the command line.

| Option        | Values                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--lang`      | Language id, e.g. `typescript`, `python`, `shell`                                                                |
| `--theme`     | `github-light`, `github-dark`, `dracula`, `nord`, `one-dark-pro`                                                 |
| `--bg`        | Background preset (`ocean`, `slate`, `sunset`, `forest`, `paper`, `charcoal`, `violet`, `rose`) or `transparent` |
| `--padding`   | `16`, `32`, `64`, `128`                                                                                          |
| `--width`     | `320`–`1600`                                                                                                     |
| `--font`      | `12`, `14`, `15`, `16`, `18`, `20`, `24`                                                                         |
| `--lh`        | Line height, `1.2`–`2`                                                                                           |
| `--window`    | `controls`, `minimal`, `borderless`                                                                              |
| `--lines`     | Line numbers: `true` or `false`                                                                                  |
| `--wrap`      | Wrap long lines: `true` or `false`                                                                               |
| `--showTitle` | Show filename: `true` or `false`                                                                                 |
| `--title`     | Window title (up to 200 characters)                                                                              |
| `--scale`     | PNG scale: `1`, `2`, `3`                                                                                         |
| `--format`    | `png` or `svg`                                                                                                   |
| `--highlight` | Lines to emphasize, e.g. `2,5-7`                                                                                 |
| `--added`     | Lines marked as added                                                                                            |
| `--removed`   | Lines marked as removed                                                                                          |

Invalid values print a clear error and exit with status 1.

## Notes

Images use the same highlighter, themes, and layout as the browser app. The drop shadow is approximated, and wrapping is by character count, so wide characters (CJK, emoji) may extend past a row.

## Links

- [CodePic app](https://codepic.kitdev.space/)
- [Repository](https://github.com/hamedniroomand/codepic)
- [Issues](https://github.com/hamedniroomand/codepic/issues)

## License

MIT
