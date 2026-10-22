import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Code, Root } from 'mdast';
import { afterEach, expect, test } from 'vite-plus/test';

import remarkCodepic, { blockLanguage, cliArgs, parseMeta, type Render } from './index';

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function outDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'remark-codepic-'));
  dirs.push(dir);
  return dir;
}

function code(value: string, lang: string | null, meta: string | null): Code {
  return {
    type: 'code',
    value,
    lang,
    meta,
    position: { start: { line: 3, column: 1 }, end: { line: 5, column: 1 } },
  };
}

function outputOf(args: string[]): string {
  return args.find((arg) => arg.startsWith('--output='))?.slice('--output='.length) ?? '';
}

function tree(...children: Root['children']): Root {
  return { type: 'root', children };
}

test('reads the marker and the options from the meta', () => {
  expect(parseMeta('codepic theme=nord alt="Set up the app"')).toEqual({
    theme: 'nord',
    alt: 'Set up the app',
  });
  expect(parseMeta('title="a.ts"')).toBeNull();
  expect(parseMeta('notcodepic')).toBeNull();
  expect(parseMeta('title="about codepic"')).toBeNull();
  expect(parseMeta(null)).toBeNull();
  expect(() => parseMeta('codepic annotate=1 annotate=2')).toThrow('more than once');
});

test('reads a long option string in linear time', () => {
  const started = performance.now();
  parseMeta(`codepic ${'-'.repeat(50_000)}`);
  expect(performance.now() - started).toBeLessThan(200);
});

test('passes only appearance options to the command line tool', () => {
  expect(cliArgs({ theme: 'nord', title: '-o x' })).toEqual(['--theme=nord', '--title=-o x']);
  expect(() => cliArgs({ file: '/etc/passwd' })).toThrow('Unknown option "file"');
  expect(() => cliArgs({ output: 'x' })).toThrow('Unknown option "output"');
  expect(() => cliArgs({ format: 'png' })).toThrow('Unknown option "format"');
});

test('replaces a marked code block with an image and leaves others alone', async () => {
  const calls: [string, string[]][] = [];
  const render: Render = async (value, args) => {
    calls.push([value, args]);
    writeFileSync(outputOf(args), '<svg/>');
  };
  const dir = outDir();
  const root = tree(code('const a = 1;', 'ts', 'codepic theme=nord'), code('plain', 'ts', null));
  await remarkCodepic({ outDir: dir, publicPath: '/img', defaults: { bg: 'slate' }, render })(root);

  expect(root.children[1]).toMatchObject({ type: 'code', value: 'plain' });
  const image = (root.children[0] as { children: { url: string; alt: string }[] }).children[0];
  expect(image.url).toMatch(/^\/img\/codepic-[0-9a-f]{16}\.svg$/);
  expect(image.alt).toBe('const a = 1;');
  expect(calls).toHaveLength(1);
  expect(calls[0][0]).toBe('const a = 1;');
  expect(calls[0][1]).toEqual(
    expect.arrayContaining(['--bg=slate', '--lang=typescript', '--theme=nord']),
  );
});

test('skips an image that already exists', async () => {
  let count = 0;
  const render: Render = async (_value, args) => {
    count++;
    writeFileSync(outputOf(args), '<svg/>');
  };
  const dir = outDir();
  await remarkCodepic({ outDir: dir, render })(tree(code('a', null, 'codepic')));
  await remarkCodepic({ outDir: dir, render })(tree(code('a', null, 'codepic')));
  expect(count).toBe(1);
});

test('names the line of a block that fails', async () => {
  const render: Render = async () => {
    throw new Error('Unknown theme "neon".');
  };
  await expect(
    remarkCodepic({ outDir: outDir(), render })(tree(code('a', null, 'codepic theme=neon'))),
  ).rejects.toThrow('codepic at line 3: Unknown theme "neon".');
  await expect(
    remarkCodepic({ outDir: outDir(), render })(tree(code('a', null, 'codepic file=x'))),
  ).rejects.toThrow('codepic at line 3: Unknown option "file"');
});

test('maps code block languages and lets unknown ones be guessed', () => {
  expect(blockLanguage('ts')).toBe('typescript');
  expect(blockLanguage('YML')).toBe('yaml');
  expect(blockLanguage('go')).toBe('go');
  expect(blockLanguage('cobol')).toBeNull();
  expect(blockLanguage(null)).toBeNull();
});

test('draws code that repeats once, and checks options when the image exists', async () => {
  let count = 0;
  const render: Render = async (_value, args) => {
    count++;
    writeFileSync(outputOf(args), '<svg/>');
  };
  const dir = outDir();
  await remarkCodepic({ outDir: dir, defaults: { alt: 'Code' }, render })(
    tree(code('a', null, 'codepic'), code('a', null, 'codepic')),
  );
  expect(count).toBe(1);
  expect(readdirSync(dir)).toHaveLength(1);
  await expect(
    remarkCodepic({ outDir: dir, render })(tree(code('a', null, 'codepic thme=nord'))),
  ).rejects.toThrow('Unknown option "thme"');
});

test('leaves no file behind when drawing fails', async () => {
  const dir = outDir();
  const render: Render = async (_value, args) => {
    writeFileSync(outputOf(args), 'half');
    throw new Error('disk full');
  };
  await expect(
    remarkCodepic({ outDir: dir, render })(tree(code('a', null, 'codepic'))),
  ).rejects.toThrow('disk full');
  expect(readdirSync(dir)).toEqual([]);
});
