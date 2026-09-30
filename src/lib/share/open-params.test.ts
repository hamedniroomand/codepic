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

const empty = { appearance: null, code: null, marks: null };
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
  };
  const boot = resolveBoot(shared, '?theme=nord&code=other', saved);

  expect(boot.appearance.themeId).toBe('github-light');
  expect(boot.code).toBe('shared');
});

test('reports ignored parameters as a notice', () => {
  expect(resolveBoot(empty, '?theme=neon', saved).notice).toContain('Unknown theme');
});
