import type { BackgroundConfig } from '$lib/appearance-config';

export type BackgroundPreset = {
  id: string;
  label: string;
  mode: 'solid' | 'gradient';
  css: string;
};

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'ocean',
    label: 'Ocean',
    mode: 'gradient',
    css: 'linear-gradient(135deg, #a5d8f5 0%, #629fe1 48%, #305cb5 100%)',
  },
  {
    id: 'slate',
    label: 'Slate',
    mode: 'gradient',
    css: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    mode: 'gradient',
    css: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fbbf24 100%)',
  },
  {
    id: 'forest',
    label: 'Forest',
    mode: 'gradient',
    css: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #4ade80 100%)',
  },
  { id: 'paper', label: 'Paper', mode: 'solid', css: '#f8fafc' },
  { id: 'charcoal', label: 'Charcoal', mode: 'solid', css: '#18181b' },
  {
    id: 'violet',
    label: 'Violet',
    mode: 'gradient',
    css: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #c084fc 100%)',
  },
  {
    id: 'rose',
    label: 'Rose',
    mode: 'gradient',
    css: 'linear-gradient(135deg, #881337 0%, #e11d48 100%)',
  },
];

export function backgroundStyle(bg: BackgroundConfig): Record<string, string> {
  if (bg.mode === 'transparent') {
    return { backgroundColor: 'transparent', backgroundImage: 'none' };
  }
  if (bg.mode === 'solid' && bg.solidColor) {
    return { backgroundColor: bg.solidColor, backgroundImage: 'none' };
  }
  if (bg.mode === 'gradient' && bg.gradientFrom && bg.gradientTo) {
    return {
      backgroundColor: bg.gradientFrom,
      backgroundImage: `linear-gradient(135deg, ${bg.gradientFrom} 0%, ${bg.gradientTo} 100%)`,
    };
  }
  const preset = BACKGROUND_PRESETS.find((p) => p.id === bg.presetId) ?? BACKGROUND_PRESETS[0];
  if (bg.mode === 'solid' || preset.mode === 'solid') {
    return {
      backgroundColor: preset.mode === 'solid' ? preset.css : '#1e293b',
      backgroundImage: 'none',
    };
  }
  return { backgroundColor: 'transparent', backgroundImage: preset.css };
}
