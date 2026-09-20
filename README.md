# CodePic

CodePic turns a code snippet into a PNG snapshot. You paste code, adjust appearance, and export. The tool runs in the browser. It does not need an account or a server for normal use.

## Primary flow

1. Edit code directly in the centered snapshot window.
2. Use the bottom toolbar for theme, background, dark mode, line numbers, padding, and language.
3. Drag the side handles to change export width.
4. Select **Download PNG** or **Copy image**.

The stack is **Svelte 5 + TypeScript + Vite+**.

## Supported languages

JavaScript, TypeScript, HTML, CSS, JSON, Shell, Python, Go, PHP, SQL, Java, C#, Rust, Markdown, Plain Text.

Unknown input falls back to plain text. Invalid syntax still renders.

## Customization

- **Themes:** light, dark, and colorful Shiki themes (syntax colors and code window chrome).
- **Background:** solid, gradient presets, or transparent (checkerboard in preview).
- **Layout:** padding presets and output width from 320 to 1600 pixels.
- **Code display:** line numbers, wrap, and font size.
- **Window:** minimal, decorative window controls, or borderless; optional title.
- **Export scale:** 1×, 2× (default), or 3×.

Theme and background are independent. Changing theme does not change the image background.

## Export

- Format: PNG only in this release.
- **Download** saves a file. **Copy image** uses the Clipboard API when the browser allows it.
- If clipboard write fails or is unsupported, the UI shows a message and download still works.
- Transparent backgrounds export with alpha.
- Export uses the configured width and scale, not the on-screen preview scale.
- Export waits for code colors and fonts. Controls pause until export ends.

## Local preferences

Appearance choices are stored in `localStorage`. Pasted code is not stored. Corrupt storage falls back to defaults.

## Share link

Existing URLs with a `#s=` fragment can load code and appearance settings. The toolbar does not create share links.

## Design decisions

- **Separate code and appearance:** one config object drives the snapshot; code is separate so sharing and persistence can treat them differently.
- **Local-first:** highlighting and export run client-side. Code is not sent to a backend during normal editing.
- **Lightweight editor:** a textarea preserves bytes exactly; there is no IDE feature set.

## Out of scope

Full code editor, IDE features, collaboration, code execution, hosting, and Git browsing.

## Limits

- Long snippets take more time to highlight and export.
- The preview scales to fit the screen. Image settings expand below the toolbar.
- Clipboard image copy varies by browser and permission.

## Development

```sh
vp install
bun run dev
vp check
bun test
vp test
bun run build
```

## Safety checks

See [docs/VERIFICATION.md](docs/VERIFICATION.md) for a repeatable pass on HTML and script safety.
