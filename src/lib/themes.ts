export type ThemeDef = {
  id: string;
  label: string;
  shiki: string;
  dark: boolean;
  window: { bg: string; border: string; title: string; muted: string };
};

export const THEMES: ThemeDef[] = [
  {
    id: 'github-light',
    label: 'GitHub Light',
    shiki: 'github-light',
    dark: false,
    window: { bg: '#ffffff', border: '#d0d7de', title: '#57606a', muted: '#656d76' },
  },
  {
    id: 'github-dark',
    label: 'GitHub Dark',
    shiki: 'github-dark',
    dark: true,
    window: { bg: '#0d1117', border: '#30363d', title: '#8b949e', muted: '#6e7681' },
  },
  {
    id: 'dracula',
    label: 'Dracula',
    shiki: 'dracula',
    dark: true,
    window: { bg: '#282a36', border: '#44475a', title: '#bd93f9', muted: '#6272a4' },
  },
  {
    id: 'nord',
    label: 'Nord',
    shiki: 'nord',
    dark: true,
    window: { bg: '#2e3440', border: '#4c566a', title: '#88c0d0', muted: '#81a1c1' },
  },
  {
    id: 'one-dark-pro',
    label: 'One Dark Pro',
    shiki: 'one-dark-pro',
    dark: true,
    window: { bg: '#282c34', border: '#3e4451', title: '#abb2bf', muted: '#5c6370' },
  },
];

export const DEFAULT_DARK_THEME = 'github-dark';
export const DEFAULT_LIGHT_THEME = 'github-light';

export function themeById(id: string): ThemeDef {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[1];
}

export function isDarkTheme(id: string): boolean {
  return themeById(id).dark;
}

export function toggleDarkTheme(id: string): string {
  return isDarkTheme(id) ? DEFAULT_LIGHT_THEME : DEFAULT_DARK_THEME;
}
