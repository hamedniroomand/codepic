import { DEFAULT_APPEARANCE, parseAppearance, type AppearanceConfig } from '$lib/appearance-config';

const STORAGE_KEY = 'codepic-appearance-v2';
const LEGACY_STORAGE_KEY = 'codepic-appearance-v1';

export function loadAppearance(): AppearanceConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? parseAppearance(JSON.parse(raw)) : { ...DEFAULT_APPEARANCE };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

export function saveAppearance(config: AppearanceConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage is full or blocked. The image still renders from memory.
  }
}
