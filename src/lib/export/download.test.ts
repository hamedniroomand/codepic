import { expect, test } from 'bun:test';

import { filenameFor } from './download';

test('names the file after the title', () => {
  expect(filenameFor('my snippet.ts', 'png')).toBe('my-snippet.ts.png');
});

test('falls back to a default name', () => {
  expect(filenameFor('   ', 'svg')).toBe('codepic.svg');
});
