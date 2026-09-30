# CodePic

Turn a code snippet into a shareable PNG or SVG. Everything runs in the browser: no account, no upload, no server.

**[Try it →](https://codepic.kitdev.space/)**

A [ray.so](https://ray.so) clone, built to learn Svelte 5.

## Using it

Type or paste into the code window, adjust the dock at the bottom, then hit **Download** or **Copy image**. Drag the handles on either side of the card to change the export width.

Pasting into an empty editor, or over everything in it, guesses the language and marks the dock label as detected. When the guess is weak it falls back to plain text. Pick a language yourself and CodePic stops guessing.

The dock holds the settings you reach for most: background, theme, padding, language, and a light/dark switch. The `⋯` button opens the rest: width, font size, export format, export scale, window style, line numbers, filename, and wrapping.

**Line marks.** Click a line number to cycle it through highlighted, added (`+`) and removed (`−`). The `⋯` panel takes the same as text, such as `2,5-7`. When any line is highlighted, the rest are dimmed. Marks travel with the share link and appear in the exported image.

The grid button next to it holds **presets**. Apply a built-in look, or save the current one under a name, rename it in place, and delete it. A preset covers the look only: theme, background, padding, size and window options. It never holds your code, language or filename. Saved presets live in `localStorage`, and **Export saved** and **Import** move them between browsers as a small JSON file. A file that is not a presets file is rejected with a message.

**Install and offline.** After one visit CodePic loads and exports with no connection, and your browser can offer to install it. New versions replace the cached copy on the next visit.

**Keyboard shortcuts.** Every shortcut uses Ctrl (⌘ on macOS), so nothing fires while you type. The keyboard button in the footer lists them too.

| Action               | Shortcut               |
| -------------------- | ---------------------- |
| Download image       | Ctrl/⌘ + Enter         |
| Copy image           | Ctrl/⌘ + Shift + Enter |
| Copy share link      | Ctrl/⌘ + Shift + L     |
| Toggle more settings | Ctrl/⌘ + .             |
| Focus the editor     | Ctrl/⌘ + Shift + E     |
| Show shortcuts       | Ctrl/⌘ + /             |

**Share link** copies a URL containing your code and settings, so anyone who opens it lands on the same snapshot. The code is compressed in the browser first, so far larger snippets fit. A small meter next to the button appears as the link nears its limit. A snippet that is still too large is left out of the link and the app tells you. Links from before compression keep working.

## Open it with a link

Any page or tool can open CodePic with code and options already filled in. No server is involved: the link is read in the browser and nothing is sent anywhere.

```
https://codepic.kitdev.space/?theme=nord&lang=python&code=print(%22hi%22)
```

| Parameter   | Values                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `code`      | The snippet, URL-encoded. Up to 8,000 characters                                                                   |
| `lang`      | A language id, such as `typescript`, `python`, `shell`                                                             |
| `theme`     | `github-light`, `github-dark`, `dracula`, `nord`, `one-dark-pro`                                                   |
| `bg`        | A background preset (`ocean`, `slate`, `sunset`, `forest`, `paper`, `charcoal`, `violet`, `rose`) or `transparent` |
| `padding`   | `16`, `32`, `64` or `128`                                                                                          |
| `width`     | `320` to `1600`                                                                                                    |
| `font`      | `12`, `14`, `15`, `16`, `18`, `20` or `24`                                                                         |
| `lh`        | Line height, `1.2` to `2`                                                                                          |
| `window`    | `controls`, `minimal` or `borderless`                                                                              |
| `lines`     | Line numbers: `true`, `false`, `1` or `0`                                                                          |
| `wrap`      | Wrap long lines, same values                                                                                       |
| `showTitle` | Show the filename, same values                                                                                     |
| `title`     | The filename, up to 200 characters                                                                                 |
| `scale`     | PNG scale: `1`, `2` or `3`                                                                                         |
| `format`    | Download format: `png` or `svg`                                                                                    |
| `highlight` | Lines to emphasize, such as `2,5-7`                                                                                |
| `added`     | Lines marked as added                                                                                              |
| `removed`   | Lines marked as removed                                                                                            |

Unknown parameters are ignored. A value that is not allowed is skipped and the page says so, and the rest still apply. Nothing in a link ever runs as code.

When sources disagree, the first of these wins: a share link (`#z=`), then URL parameters, then your saved settings, then the defaults.

## Command line

```sh
npx codepic --file app.ts --theme nord -o out.png
cat app.ts | npx codepic --lang typescript -o out.svg
```

Code comes from `--file` or standard input. `-o` sets the output path, and a `.svg` name writes SVG. The language is guessed when `--lang` is not given, and the filename comes from `--file`. Every parameter in the table above works as an option with the same name and values, for example `--theme nord --highlight 2,5-7`. Run `codepic --help` for the list. Errors name the option and the values it accepts, and exit with status 1.

It uses the same highlighter, themes and layout numbers as the app, so images match closely. Two known differences: the drop shadow is an approximation, and text is wrapped by character count, so wide characters such as CJK or emoji can overrun a row. Highlighting and drawing run on your machine and nothing is uploaded.

To run it from a checkout: `pnpm run cli:build`, then `node packages/cli/dist/cli.js --help`.

## What you can change

| Setting     | Options                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| Themes      | GitHub Light, GitHub Dark, Dracula, Nord, One Dark Pro                                                     |
| Backgrounds | Six gradients, two solids, or transparent                                                                  |
| Languages   | JavaScript, TypeScript, HTML, CSS, JSON, Shell, Python, Go, PHP, SQL, Java, C#, Rust, Markdown, plain text |
| Size        | Width 320–1600px, padding 16/32/64/128, export at 1×, 2× or 3×                                             |
| Export      | PNG, or SVG with the text kept as text and the code font embedded                                          |
| Window      | Traffic-light controls, minimal, or borderless, each with an optional filename                             |

The theme colours the code; the background sits behind the card. They are independent, so changing one never disturbs the other.

## Running it

```sh
pnpm install
pnpm dev
```

Then `pnpm check` for formatting, linting and types, `pnpm test` for unit tests, and `pnpm build` to produce `dist/`.

CI runs the same checks on every push and pull request, and publishes to GitHub Pages when `main` goes green.

## How it fits together

```
src/
  styles/tokens.css      design tokens: colour, spacing, radius, type
  components/ui/         Button, Select, Toggle, Popover, Swatch, …
  components/toolbar/    the floating dock and its overflow panel
  components/preview/    the code card, resize handles, export frame
  lib/config/            appearance settings, themes, languages, backgrounds
  lib/persistence/       saved settings in localStorage
  lib/highlight/         Shiki, line splitting, language detection
  lib/marks/             line highlight and diff marks
  lib/export/            PNG and SVG capture, copy, download
  lib/share/             share links, URL parameters, startup
  lib/presets/           saved and built-in looks
  lib/shortcuts/         keyboard shortcuts
packages/cli/            the command line tool
```

One `AppearanceConfig` object drives the whole snapshot. Code is kept separate from it, so persistence and sharing can treat the two differently. Settings go to `localStorage`; your code never does.

The preview and the exported image render from the same `CodeWindow` component, which keeps them honest. The export copy lives off-screen at the exact configured width, so the image matches the settings rather than whatever the preview is scaled to.

Highlighting is [Shiki](https://shiki.style) compiled to the browser; the PNG and SVG come from [modern-screenshot](https://github.com/qq15725/modern-screenshot). Editing is a plain `<textarea>` layered over the highlighted lines. That keeps your bytes exactly as typed, and it is deliberately not an IDE.

Built with Svelte 5 (runes), TypeScript, and [Vite+](https://viteplus.dev).

## Known limits

- Very long snippets take noticeably longer to highlight and export.
- Copying to the clipboard depends on browser support and permission. When it is unavailable or blocked, the app says so and the download still works.
- SVG export embeds the card as HTML inside the SVG. Some design tools do not support that.
