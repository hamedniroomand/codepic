import { expect, test } from 'bun:test';

import { SHORTCUTS, formatShortcut, matchShortcut, type ShortcutAction } from './shortcuts';

const press = (
  key: string,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {},
): ShortcutAction | null =>
  matchShortcut({
    key,
    ctrlKey: modifiers.ctrl ?? false,
    metaKey: false,
    altKey: modifiers.alt ?? false,
    shiftKey: modifiers.shift ?? false,
  });

test('matches each shortcut with its modifiers', () => {
  expect(press('Enter', { ctrl: true })).toBe('download');
  expect(press('Enter', { ctrl: true, shift: true })).toBe('copyImage');
  expect(press('L', { ctrl: true, shift: true })).toBe('shareLink');
  expect(press('.', { ctrl: true })).toBe('toggleSettings');
  expect(press('E', { ctrl: true, shift: true })).toBe('focusEditor');
  expect(press('/', { ctrl: true })).toBe('showHelp');
});

test('command works like control', () => {
  const event = { key: 'Enter', ctrlKey: false, metaKey: true, altKey: false, shiftKey: false };
  expect(matchShortcut(event)).toBe('download');
});

test('plain keys never trigger anything, so typing is safe', () => {
  for (const { key } of SHORTCUTS) expect(press(key)).toBeNull();
});

test('ignores combinations with alt and unlisted keys', () => {
  expect(press('Enter', { ctrl: true, alt: true })).toBeNull();
  expect(press('q', { ctrl: true })).toBeNull();
});

test('has no two shortcuts on the same keys', () => {
  const combos = SHORTCUTS.map((s) => `${s.key}${s.shift ? '+shift' : ''}`);
  expect(new Set(combos).size).toBe(combos.length);
});

test('formats for each platform', () => {
  expect(formatShortcut(SHORTCUTS[1], true)).toBe('⌘⇧Enter');
  expect(formatShortcut(SHORTCUTS[1], false)).toBe('Ctrl+Shift+Enter');
});
