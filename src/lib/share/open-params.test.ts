import { expect, test } from 'vite-plus/test';

import { DEFAULT_APPEARANCE } from '$lib/config/appearance-config';

import { resolveBoot } from './boot';
import { MAX_CODE_PARAM_CHARS, parseOpenParams } from './open-params';

test('reads readable parameters', () => {
  const { appearance, code, errors } = parseOpenParams(
    '?code=let%20a%3D1&lang=javascript&theme=nord&bg=sunset&padding=32&width=800&lines=0&wrap=true',
  );

  expect(errors).toEqual([]);
  expect(code).toBe('let a=1');
  expect(appearance).toMatchObject({
    language: 'javascript',
    themeId: 'nord',
    paddingPx: 32,
    width: 800,
    lineNumbers: false,
    wrap: true,
  });
  expect(appearance.background).toMatchObject({ mode: 'gradient', presetId: 'sunset' });
});

test('reads line marks and the export format', () => {
  const { appearance, marks } = parseOpenParams('?highlight=1,3-4&added=2&format=svg');

  expect(marks).toEqual({ emphasized: [1, 3, 4], added: [2], removed: [] });
  expect(appearance.exportFormat).toBe('svg');
});

test('ignores unknown parameters', () => {
  const result = parseOpenParams('?utm_source=x&__proto__=1&constructor=2');
  expect(result).toEqual({ appearance: {}, errors: [] });
});

test('reports a bad value and leaves the setting alone', () => {
  const { appearance, errors } = parseOpenParams(
    '?theme=neon&padding=7&width=99999&lh=abc&lines=maybe',
  );

  expect(appearance).toEqual({});
  expect(errors).toHaveLength(5);
  expect(errors[0]).toContain('Unknown theme "neon"');
});

test('refuses code that is too large', () => {
  const { code, errors } = parseOpenParams(`?code=${'a'.repeat(MAX_CODE_PARAM_CHARS + 1)}`);

  expect(code).toBeUndefined();
  expect(errors[0]).toContain('share link');
});

test('a valid parameter still applies next to a bad one', () => {
  const { appearance, errors } = parseOpenParams('?theme=neon&lang=go');

  expect(appearance.language).toBe('go');
  expect(errors).toHaveLength(1);
});

const empty = { appearance: null, code: null, marks: null, annotations: null };
const saved = { ...DEFAULT_APPEARANCE, themeId: 'dracula', paddingPx: 16 as const };

test('parameters win over saved settings', () => {
  const boot = resolveBoot(empty, '?theme=nord', saved);

  expect(boot.appearance.themeId).toBe('nord');
  expect(boot.appearance.paddingPx).toBe(16);
});

test('saved settings win over defaults', () => {
  expect(resolveBoot(empty, '', saved).appearance.themeId).toBe('dracula');
});

test('a share link wins over parameters', () => {
  const shared = {
    appearance: { ...DEFAULT_APPEARANCE, themeId: 'github-light' },
    code: 'shared',
    marks: null,
    annotations: null,
  };
  const boot = resolveBoot(shared, '?theme=nord&code=other', saved);

  expect(boot.appearance.themeId).toBe('github-light');
  expect(boot.code).toBe('shared');
});

test('reports ignored parameters as a notice', () => {
  expect(resolveBoot(empty, '?theme=neon', saved).notice).toContain('Unknown theme');
});

test('reads custom background colors', () => {
  expect(parseOpenParams('?bg=FF8800').appearance.background).toMatchObject({
    mode: 'solid',
    solidColor: '#ff8800',
  });
  expect(parseOpenParams('?bg=ff8800,3355ff').appearance.background).toMatchObject({
    mode: 'gradient',
    gradientFrom: '#ff8800',
    gradientTo: '#3355ff',
  });
});

test('reports a bad background color', () => {
  for (const raw of ['ff88', 'ff8800,', 'ff8800,3355ff,000000', '%23ff8800', 'red']) {
    const { appearance, errors } = parseOpenParams(`?bg=${raw}`);
    expect(appearance.background).toBeUndefined();
    expect(errors[0]).toContain('Invalid bg');
  }
});

test('reads a signature and its corner', () => {
  const { appearance, errors } = parseOpenParams('?signature=%40me&signaturePos=top-left');
  expect(errors).toEqual([]);
  expect(appearance).toMatchObject({ signature: '@me', signaturePosition: 'top-left' });
});

test('reports a bad signature and corner', () => {
  const { appearance, errors } = parseOpenParams(
    `?signature=${'x'.repeat(61)}&signaturePos=middle`,
  );
  expect(appearance).toEqual({});
  expect(errors).toHaveLength(2);
});

test('reads the code font and ligatures', () => {
  const { appearance, errors } = parseOpenParams('?codeFont=fira-code&ligatures=0');
  expect(errors).toEqual([]);
  expect(appearance).toMatchObject({ codeFont: 'fira-code', ligatures: false });
  expect(parseOpenParams('?codeFont=comic-sans').errors[0]).toContain('Unknown codeFont');
});

test('reads the image shape', () => {
  expect(parseOpenParams('?aspect=16:9').appearance.aspect).toBe('16:9');
  expect(parseOpenParams('?aspect=2:1').errors[0]).toContain('Unknown aspect');
});

test('reads more than one annotate parameter', () => {
  const { annotations, errors } = parseOpenParams('?annotate=1:2-4&annotate=2:underline:Hi');
  expect(errors).toEqual([]);
  expect(annotations).toEqual([
    { line: 1, from: 2, to: 4, kind: 'box' },
    { line: 2, kind: 'underline', note: 'Hi' },
  ]);
});
