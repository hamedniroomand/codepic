import { linesFromHighlight } from '$lib/highlight-lines';
import { highlightCode } from '$lib/highlighter';

export type HighlightState = {
  /** One HTML string for each code line, safe to render with {@html}. */
  readonly lines: string[];
  /** Resolves when the running highlight finishes. Await it before an export. */
  readonly settled: Promise<void>;
};

type Source = () => { code: string; language: string; themeId: string };

/**
 * Call during component setup. Svelte needs an owner for the effect.
 * A generation counter drops results that arrive after a newer request.
 */
export function createHighlightState(
  source: Source,
  onError: (message: string) => void,
): HighlightState {
  let html = $state('');
  let highlightedCode = $state('');
  let settled = $state<Promise<void>>(Promise.resolve());
  let generation = 0;

  $effect(() => {
    const { code, language, themeId } = source();
    const current = ++generation;
    settled = highlightCode(code, language, themeId)
      .then((result) => {
        if (current !== generation) return;
        html = result;
        highlightedCode = code;
      })
      .catch(() => {
        if (current !== generation) return;
        html = '';
        highlightedCode = code;
        onError('Code colors could not load. You can still download the image.');
      });
  });

  const lines = $derived(
    linesFromHighlight(highlightedCode === source().code ? html : '', source().code),
  );

  return {
    get lines(): string[] {
      return lines;
    },
    get settled(): Promise<void> {
      return settled;
    },
  } satisfies HighlightState;
}
