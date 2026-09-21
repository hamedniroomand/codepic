# CodePic

Turn a code snippet into a shareable PNG. Everything runs in the browser: no account, no upload, no server.

**[Try it →](https://hamedniroomand.github.io/codepic/)**

A [ray.so](https://ray.so) clone, built to learn Svelte 5.

## Using it

Type or paste into the code window, adjust the dock at the bottom, then hit **Download PNG** or **Copy image**. Drag the handles on either side of the card to change the export width.

The dock holds the settings you reach for most: background, theme, padding, language, and a light/dark switch. The `⋯` button opens the rest: width, font size, export scale, window style, line numbers, filename, and wrapping.

**Share link** copies a URL containing your code and settings, so anyone who opens it lands on the same snapshot. Snippets over 1200 characters are dropped from the link and the app tells you.

## What you can change

| Setting     | Options                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| Themes      | GitHub Light, GitHub Dark, Dracula, Nord, One Dark Pro                                                     |
| Backgrounds | Six gradients, two solids, or transparent                                                                  |
| Languages   | JavaScript, TypeScript, HTML, CSS, JSON, Shell, Python, Go, PHP, SQL, Java, C#, Rust, Markdown, plain text |
| Size        | Width 320–1600px, padding 16/32/64/128, export at 1×, 2× or 3×                                             |
| Window      | Traffic-light controls, minimal, or borderless, each with an optional filename                             |

The theme colours the code; the background sits behind the card. They are independent, so changing one never disturbs the other.

## Running it

```sh
bun install
bun run dev
```

Then `bun run check` for formatting, linting and types, `bun run test` for unit tests, and `bun run build` to produce `dist/`.

CI runs the same checks on every push and pull request, and publishes to GitHub Pages when `main` goes green.

## How it fits together

```
src/
  styles/tokens.css      design tokens: colour, spacing, radius, type
  components/ui/         Button, Select, Toggle, Popover, Swatch, …
  components/toolbar/    the floating dock and its overflow panel
  components/preview/    the code card, resize handles, export frame
  lib/                   config, themes, highlighting, export, sharing
```

One `AppearanceConfig` object drives the whole snapshot. Code is kept separate from it, so persistence and sharing can treat the two differently. Settings go to `localStorage`; your code never does.

The preview and the exported image render from the same `CodeWindow` component, which keeps them honest. The export copy lives off-screen at the exact configured width, so the PNG matches the settings rather than whatever the preview is scaled to.

Highlighting is [Shiki](https://shiki.style) compiled to the browser; the PNG comes from [modern-screenshot](https://github.com/qq15725/modern-screenshot). Editing is a plain `<textarea>` layered over the highlighted lines. That keeps your bytes exactly as typed, and it is deliberately not an IDE.

Built with Svelte 5 (runes), TypeScript, and [Vite+](https://viteplus.dev).

## Known limits

- Very long snippets take noticeably longer to highlight and export.
- Copying to the clipboard depends on browser support and permission. If it fails, the download still works.
- PNG is the only export format.
