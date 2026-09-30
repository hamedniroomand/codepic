import { DEFAULT_APPEARANCE, parseAppearance } from '$lib/appearance-config';

import { createPreset, lookOf, type Preset } from './presets';

const solid = (presetId: string): { mode: 'solid'; presetId: string } => ({
  mode: 'solid',
  presetId,
});
const gradient = (presetId: string): { mode: 'gradient'; presetId: string } => ({
  mode: 'gradient',
  presetId,
});

const builtin = (name: string, look: Record<string, unknown>): Preset => ({
  ...createPreset(name, lookOf(parseAppearance({ ...DEFAULT_APPEARANCE, ...look }))),
  id: `builtin-${name.toLowerCase().replaceAll(' ', '-')}`,
});

export const BUILTIN_PRESETS: Preset[] = [
  builtin('Default', {}),
  builtin('Clean light', {
    themeId: 'github-light',
    background: solid('paper'),
    windowStyle: 'minimal',
  }),
  builtin('Midnight', { themeId: 'dracula', background: gradient('violet') }),
  builtin('Terminal', {
    themeId: 'one-dark-pro',
    background: solid('charcoal'),
    windowStyle: 'borderless',
    paddingPx: 32,
    lineNumbers: false,
  }),
  builtin('Sunset', { themeId: 'nord', background: gradient('sunset') }),
];
