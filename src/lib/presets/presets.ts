import { parseAppearance, type AppearanceConfig } from '$lib/config/appearance-config';

/** Everything about how the card looks. The language and filename belong to the code. */
export type Look = Omit<AppearanceConfig, 'language' | 'title'>;

export type Preset = { id: string; name: string; look: Look };

const FILE_VERSION = 1;

export function lookOf(appearance: AppearanceConfig): Look {
  const look: Partial<AppearanceConfig> = { ...appearance };
  delete look.language;
  delete look.title;
  return look as Look;
}

export function createPreset(name: string, look: Look): Preset {
  return { id: crypto.randomUUID(), name: name.trim(), look };
}

export function serializePresets(presets: Preset[]): string {
  const entries = presets.map(({ name, look }) => ({ name, look }));
  return JSON.stringify({ version: FILE_VERSION, presets: entries }, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Throws an Error whose message is fit to show the user. */
export function parsePresets(text: string): Preset[] {
  let file: unknown;
  try {
    file = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!isRecord(file) || file.version !== FILE_VERSION || !Array.isArray(file.presets)) {
    throw new Error('That file is not a CodePic presets file.');
  }
  return file.presets.map((entry, index) => {
    const name = isRecord(entry) && typeof entry.name === 'string' ? entry.name.trim() : '';
    if (!name || !isRecord(entry) || !isRecord(entry.look)) {
      throw new Error(`Preset ${index + 1} needs a name and settings.`);
    }
    return createPreset(name, lookOf(parseAppearance(entry.look)));
  });
}
