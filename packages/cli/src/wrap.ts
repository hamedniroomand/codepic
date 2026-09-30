export type Token = { content: string; color?: string };

/** Splits one line into rows of at most `columns` characters. A monospace font makes this exact. */
export function wrapTokens(tokens: Token[], columns: number): Token[][] {
  const rows: Token[][] = [[]];
  let used = 0;
  for (const token of tokens) {
    let rest = token.content;
    while (rest) {
      if (used === columns) {
        rows.push([]);
        used = 0;
      }
      const chunk = rest.slice(0, columns - used);
      rows[rows.length - 1].push({ ...token, content: chunk });
      used += chunk.length;
      rest = rest.slice(chunk.length);
    }
  }
  return rows;
}
