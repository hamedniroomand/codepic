import type { BackgroundConfig } from '$lib/config/appearance-config';

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

/** True when the background uses its own colors and not a preset. */
export function customBackground(bg: BackgroundConfig): boolean {
  if (bg.mode === 'solid') return Boolean(bg.solidColor);
  if (bg.mode === 'gradient') return Boolean(bg.gradientFrom && bg.gradientTo);
  return false;
}

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

const HEX = /#([0-9a-f]{6})\b/gi;

/**
 * Text color for a signature on this background: light on dark colors and dark on light
 * colors. A transparent background has no known color, so a middle gray is used.
 */
export function signatureColor(bg: BackgroundConfig): string {
  const { backgroundColor, backgroundImage } = backgroundStyle(bg);
  const hexes = [...`${backgroundColor} ${backgroundImage}`.matchAll(HEX)].map((match) => match[1]);
  if (!hexes.length) return '#808080';
  const luminance =
    hexes.reduce((sum, hex) => {
      const [r, g, b] = [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16));
      return sum + 0.299 * r + 0.587 * g + 0.114 * b;
    }, 0) / hexes.length;
  return luminance > 150 ? '#0f172acc' : '#ffffffd9';
}
