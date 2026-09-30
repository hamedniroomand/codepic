# CodePic UI redesign

## Intent and approved direction

Make CodePic feel like a professional code image studio. The user requested a complete UI redesign, better dropdowns and popups through a headless component library, and a GitHub link. The approved direction is a spacious preview with a right settings sidebar, slate surfaces with blue accents, Bits UI primitives, and responsive mobile settings in a bottom sheet.

Success means the controls are visually consistent, easy to discover, usable with a keyboard, and comfortable on small screens. The editable code image remains the main focus. Existing editing, highlighting, presets, line marks, resize handles, sharing, export, persistence, and offline use must continue working.

## Component foundation

Use Bits UI for Svelte 5 with custom CSS. Keep reusable wrappers in `src/components/ui` so application controls share sizing, styling, labels, and focus behavior. Use a consistent SVG icon family through `@lucide/svelte`, importing individual icons.

Use Select for finite options, Combobox for searchable language selection, Popover for compact contextual content, Dialog for presets and shortcut help, and Switch for boolean settings. Use Dialog with mobile sheet styling for mobile settings. Native text and numeric inputs remain appropriate and receive the same visual treatment. Buttons and segmented choices share the token system.

Popover content anchors to its trigger with viewport collision handling. Dialogs trap focus, close with Escape and outside interaction, and restore focus to their trigger. Dropdowns provide arrow navigation, selected indicators, visible focus, and scrolling when necessary. Portaled menus inside dialogs must remain usable without losing the dialog focus boundary. Dialogs have visible headings and close buttons. Honor reduced motion.

## Visual system

- Workspace: `#111827`, a quiet slate canvas.
- Panels: `#182234`, distinct from the workspace.
- Inputs and inset controls: `#0f172a`.
- Borders: `#334155`.
- Primary text: `#f1f5f9`; secondary text: `#94a3b8`.
- Accent: `#60a5fa`, with dark text on primary filled actions.

Keep Inter Variable for the UI and JetBrains Mono for code. Use 12px supporting text, 13–14px labels and controls, 16px section headings, and a 20px brand. Normal sentence case, clear weight changes, and left alignment establish hierarchy. Controls are approximately 38px tall, with larger touch targets on mobile. Use 8px control corners, 12px panel corners, and restrained shadows on floating surfaces. Blue is reserved for actions, selected states, and focus.

The snapshot retains its independently selected background and syntax theme. The colorful generated image is the visual centerpiece; application chrome should support it.

## Desktop layout

At viewport widths of 960px and above, use a compact header, a two-column workspace, and a small footer. The right inspector is approximately 320px wide. The preview occupies the remaining width and has enough room to show resize handles and its dimension readout. The inspector scrolls independently when height is constrained; long code remains reachable through workspace scrolling.

Header: CodePic brand on the left; repository link, Share link, Copy image, and primary Download action on the right. Preserve export progress and disabled states, and the share-size indicator when nearing the existing limit.

Inspector sections:

1. Appearance: preset manager, visual background swatches including transparent, theme options with small syntax color indicators, and the existing dark/light theme toggle.
2. Code: searchable language picker with detected-language feedback, font size, window style, filename visibility, wrapping, and line numbers.
3. Layout: image width, padding segmented control, and line-mark inputs.
4. Export: PNG/SVG format and 1×/2×/3× scale, with an output width readout based on width and scale for PNG.

Use dividers and small section headings rather than separate cards around every field. Preserve all currently exposed settings; show and edit the filename in the preview as today.

## Mobile layout

Below 960px, use the full width for the preview and expose a clearly labeled Settings button in a bottom action area. It opens a modal bottom sheet containing the same inspector controls, with a title, close button, scrollable body, and safe-area padding. Do not mount two editable inspector instances: maintain one settings view in the active layout to avoid duplicated preset stores, field IDs, and state.

Keep Download visible in the compact header. Secondary actions may become icon buttons with accessible names and tooltips. At 360px wide, no page-level horizontal overflow is acceptable. The settings sheet and dialogs must fit the viewport, including when the on-screen keyboard is open.

## Presets, shortcuts, and feedback

Present presets in a dialog with miniature look previews for built-in presets, saved presets with apply/rename/delete actions, and a labeled save form. Preserve import and export of saved presets. Inputs must have accessible names, including saved preset names and the file import control. Show clear empty-state guidance when no user presets exist.

Keyboard help becomes a dialog with readable action/key rows. Replace the current `togglePopover()` shortcuts with explicit Svelte state. The settings shortcut toggles the mobile sheet; on desktop it focuses the inspector's first control, since settings are already visible. Other existing shortcuts retain their behavior. Close state remains synchronized when a library primitive dismisses a surface.

Restyle feedback as a compact, readable toast with a status announcement. Preserve actionable existing error messages for clipboard, export, and import failures. Export progress remains apparent and prevents overlapping exports.

## GitHub and attribution

Header repository link: `https://github.com/hamedniroomand/codepic`, labeled GitHub with an accessible repository description.

Footer author link: “Built by Hamed,” linking to `https://github.com/hamedniroomand`. Keep a compact local-processing privacy message and the existing Ray.so attribution. External links open in a new tab with appropriate rel attributes.

These URLs come from the repository metadata and are the agreed defaults unless the user supplies alternatives.

## State and integration

`App.svelte` continues owning code, appearance, marks, export, share, and status state. The inspector receives appearance and callbacks rather than maintaining a second configuration. UI open state is separate from persisted appearance. Rendering primitives must not alter configuration serialization or include app chrome in downloaded images.

Update the application tokens and global CSS, header, preview stage chrome, settings components, shortcuts help, preset manager, and all common controls as one cohesive redesign. Adjust the PWA theme/background colors and documentation to match the final UI. Keep the export frame's exact configured dimensions and preview/export correspondence.

## Verification and acceptance

Run the repository's format, lint, and type checks, existing unit tests, and production build. Verify the Svelte components compile, since the component migration changes markup and props.

Review the running app at desktop and mobile sizes. Exercise editing, detected language and manual selection, all inspector sections, resize handles, presets save/apply/rename/delete/import/export, shortcuts, share link, PNG and SVG download, and copy feedback. Verify controls using keyboard navigation, Escape dismissal, focus restoration, dropdown positioning, long menus, and nested dialog/menu interactions. Check long code, narrow screens, sheet scrolling, and GitHub destinations. Inspect screenshots for typography, alignment, overflow, and contrast.

Add focused regression coverage only where the migration introduces behavior that existing tests do not exercise, especially open-state and shortcut integration. A successful build alone is insufficient evidence for dialog and keyboard behavior; inspect those interactions in the browser.

## Scope boundaries

This work changes the UI and its interaction primitives. It does not introduce accounts, a backend, new storage formats, new export formats, or a separate marketing site. It does not publish or deploy the application.
