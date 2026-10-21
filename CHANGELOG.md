# Changelog

Notable changes to the `codepic` command line tool. The web app is deployed as it changes, so it has
no versions of its own.

## Unreleased

### Added

- `--aspect 16:9`, `1:1` or `4:5` makes the image a fixed shape, for posts and slides. The card is in the centre. It gets smaller when the code is too tall.
- `--codeFont <id>` picks the code font for PNG and SVG output: `jetbrains-mono` (default), `fira-code`, `source-code-pro` or `ibm-plex-mono`. `--ligatures false` turns ligatures off.
- Ten more themes, such as `--theme tokyo-night` and `--theme catppuccin-latte`.
- Twelve more languages: JSX, TSX, C, C++, Kotlin, Swift, Ruby, YAML, TOML, Dockerfile, Svelte and Vue. The language guess also finds them.
- `--signature` and `--signaturePos` add short text, such as `@yourname`, in a corner of the image.
- `--bg` accepts a 6-digit hex color without `#`, such as `--bg ff8800`, or two colors for a gradient, such as `--bg ff8800,3355ff`.

## 0.1.1

### Added

- The npm package now includes a README with install steps, usage and the option reference.

## 0.1.0

The first release of the command line tool, published to npm by hand.

### Added

- `codepic` draws a code snippet as a PNG or SVG without a browser: `npx codepic --file app.ts --theme nord -o out.png`. Code comes from `--file` or standard input, and an output name ending in `.svg` (or `--format svg`) writes SVG.
- Every URL parameter of the web app works as an option with the same name and values: `--lang`, `--theme`, `--bg`, `--padding`, `--width`, `--font`, `--lh`, `--window`, `--lines`, `--wrap`, `--showTitle`, `--title`, `--scale`, `--format`, `--highlight`, `--added` and `--removed`.
- The language is guessed from the code when `--lang` is not given, and the filename comes from `--file`.
- A bad option names the option and the values it accepts, and the command exits with status 1.
- It uses the same highlighter, themes and layout numbers as the web app. The drop shadow is an approximation, and text is wrapped by character count, so wide characters such as CJK or emoji can overrun a row.
- It needs Node 22 or newer. Nothing is uploaded.

### Project

- Later versions are published by a workflow when a `cli-v<version>` tag is pushed, using npm trusted publishing, so no npm token is stored.
