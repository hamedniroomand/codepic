import { escapePlain } from '$lib/highlighter';

export function linesFromHighlight(highlightedHtml: string, rawCode: string): string[] {
  const div = document.createElement('div');
  div.innerHTML = highlightedHtml;
  const lineEls = div.querySelectorAll('.line');
  if (lineEls.length > 0) {
    return [...lineEls].map((el) => el.innerHTML);
  }
  return rawCode.split('\n').map((line) => escapePlain(line));
}
