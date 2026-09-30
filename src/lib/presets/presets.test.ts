import { expect, test } from 'bun:test';

import { DEFAULT_APPEARANCE } from '$lib/appearance-config';

import { BUILTIN_PRESETS } from './builtin-presets';
import { createPreset, lookOf, parsePresets, serializePresets } from './presets';

const appearance = {
  ...DEFAULT_APPEARANCE,
  themeId: 'nord',
  paddingPx: 128 as const,
  width: 900,
  lineNumbers: false,
  language: 'rust',
  title: 'main.rs',
};

test('a look leaves out the language and the filename', () => {
  const look = lookOf(appearance);
  expect('language' in look).toBe(false);
  expect('title' in look).toBe(false);
  expect(look.themeId).toBe('nord');
});

test('a saved preset restores every setting of the look', () => {
  const look = lookOf(appearance);
  const [restored] = parsePresets(serializePresets([createPreset('Mine', look)]));

  expect(restored.name).toBe('Mine');
  expect(restored.look).toEqual(look);
});

test('the file holds names and looks and nothing else', () => {
  const file = JSON.parse(serializePresets([createPreset('Mine', lookOf(appearance))]));

  expect(Object.keys(file)).toEqual(['version', 'presets']);
  expect(Object.keys(file.presets[0])).toEqual(['name', 'look']);
});

test.each([
  ['not json', 'not valid JSON'],
  ['[]', 'not a CodePic presets file'],
  ['{"version":2,"presets":[]}', 'not a CodePic presets file'],
  ['{"version":1}', 'not a CodePic presets file'],
  ['{"version":1,"presets":[{"look":{}}]}', 'Preset 1 needs a name'],
  ['{"version":1,"presets":[{"name":"  ","look":{}}]}', 'Preset 1 needs a name'],
  ['{"version":1,"presets":[{"name":"a","look":{}},{"name":"b"}]}', 'Preset 2 needs a name'],
])('rejects %s', (text, message) => {
  expect(() => parsePresets(text)).toThrow(message);
});

test('unknown values in a look fall back to defaults', () => {
  const [preset] = parsePresets('{"version":1,"presets":[{"name":"a","look":{"themeId":7}}]}');
  expect(preset.look.themeId).toBe(DEFAULT_APPEARANCE.themeId);
});

test('built-in presets have distinct names and ids', () => {
  const names = BUILTIN_PRESETS.map((preset) => preset.name);
  const ids = BUILTIN_PRESETS.map((preset) => preset.id);
  expect(new Set(names).size).toBe(names.length);
  expect(new Set(ids).size).toBe(ids.length);
});
