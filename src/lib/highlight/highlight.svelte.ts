import { linesFromHighlight } from '$lib/highlight/highlight-lines';
import { highlightCode } from '$lib/highlight/highlighter';

export type HighlightState = {
  /** For each panel, one HTML string for each code line, safe to render with {@html}. */
  readonly lines: string[][];
  /** Resolves when the running highlight of every panel finishes. Await it before an export. */
  readonly settled: Promise<void>;
};

type Source = () => { panels: { code: string; language: string }[]; themeId: string };

type Result = { html: string; code: string };

/**
 * Call during component setup. Svelte needs an owner for the effect.
 * A generation counter drops results that arrive after a newer request.
 */
export function createHighlightState(
  source: Source,
  onError: (message: string) => void,
): HighlightState {
  let results = $state<Result[]>([]);
  let settled = $state<Promise<void>>(Promise.resolve());
  let generation = 0;

  $effect(() => {
    const { panels, themeId } = source();
    const current = ++generation;
    let failed = false;
    settled = Promise.all(
      panels.map(({ code, language }) =>
        highlightCode(code, language, themeId).catch(() => {
          failed = true;
          return '';
        }),
      ),
    ).then((html) => {
      if (current !== generation) return;
      results = html.map((item, index) => ({ html: item, code: panels[index].code }));
      if (failed) onError('Code colors could not load. You can still download the image.');
    });
  });

  // Highlighted HTML shows only for the code it was made from, so no old colors show while typing.
  const lines = $derived(
    source().panels.map(({ code }, index) =>
      linesFromHighlight(results[index]?.code === code ? results[index].html : '', code),
    ),
  );

  return {
    get lines(): string[][] {
      return lines;
    },
    get settled(): Promise<void> {
      return settled;
    },
  };
}
