import { createPreset, parsePresets, serializePresets, type Look, type Preset } from './presets';

const STORAGE_KEY = 'codepic-presets-v1';

export type PresetStore = {
  readonly saved: Preset[];
  save: (name: string, look: Look) => void;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  /** Adds the presets in a file and returns how many. Throws with a message for the user. */
  import: (text: string) => number;
  export: () => string;
};

function load(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parsePresets(raw) : [];
  } catch {
    return [];
  }
}

export function createPresetStore(): PresetStore {
  let saved = $state<Preset[]>(load());

  function commit(next: Preset[]): void {
    saved = next;
    try {
      localStorage.setItem(STORAGE_KEY, serializePresets(next));
    } catch {
      // Storage is full or blocked. The presets still work until the page closes.
    }
  }

  return {
    get saved(): Preset[] {
      return saved;
    },
    save: (name, look) => commit([...saved, createPreset(name, look)]),
    rename(id, name) {
      const trimmed = name.trim();
      if (trimmed)
        commit(saved.map((preset) => (preset.id === id ? { ...preset, name: trimmed } : preset)));
    },
    remove: (id) => commit(saved.filter((preset) => preset.id !== id)),
    import(text) {
      const added = parsePresets(text);
      commit([...saved, ...added]);
      return added.length;
    },
    export: () => serializePresets(saved),
  };
}
