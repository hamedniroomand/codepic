import { expect, test } from 'vite-plus/test';

import { parseCliArgs } from './args';

test('reads the file, the output and appearance options', () => {
  const options = parseCliArgs([
    '--file',
    'app.ts',
    '-o',
    'out.png',
    '--theme',
    'nord',
    '--lines',
    'false',
  ]);

  expect(options.file).toBe('app.ts');
  expect(options.output).toBe('out.png');
  expect(new URLSearchParams(options.query).get('theme')).toBe('nord');
  expect(new URLSearchParams(options.query).get('lines')).toBe('false');
});

test('keeps file and output out of the appearance query', () => {
  expect(parseCliArgs(['-f', 'a.ts', '-o', 'a.png']).query).toBe('');
});

test('asks for help', () => {
  expect(parseCliArgs(['-h']).help).toBe(true);
});

test('rejects an unknown option', () => {
  expect(() => parseCliArgs(['--colour', 'red'])).toThrow("Unknown option '--colour'");
});

test('rejects an option that is missing its value', () => {
  expect(() => parseCliArgs(['--theme'])).toThrow();
});
