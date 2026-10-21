export type ThemeDef = {
  id: string;
  label: string;
  shiki: string;
  dark: boolean;
  window: { bg: string; border: string; title: string; muted: string };
  /** Three token colors for the theme picker. */
  palette: readonly string[];
};

export const THEMES: ThemeDef[] = [
  {
    id: 'github-light',
    label: 'GitHub Light',
    shiki: 'github-light',
    dark: false,
    window: { bg: '#ffffff', border: '#d0d7de', title: '#57606a', muted: '#656d76' },
    palette: ['#cf222e', '#0550ae', '#116329'],
  },
  {
    id: 'github-dark',
    label: 'GitHub Dark',
    shiki: 'github-dark',
    dark: true,
    window: { bg: '#0d1117', border: '#30363d', title: '#8b949e', muted: '#6e7681' },
    palette: ['#ff7b72', '#79c0ff', '#a5d6ff'],
  },
  {
    id: 'dracula',
    label: 'Dracula',
    shiki: 'dracula',
    dark: true,
    window: { bg: '#282a36', border: '#44475a', title: '#bd93f9', muted: '#6272a4' },
    palette: ['#ff79c6', '#bd93f9', '#50fa7b'],
  },
  {
    id: 'nord',
    label: 'Nord',
    shiki: 'nord',
    dark: true,
    window: { bg: '#2e3440', border: '#4c566a', title: '#88c0d0', muted: '#81a1c1' },
    palette: ['#81a1c1', '#88c0d0', '#a3be8c'],
  },
  {
    id: 'one-dark-pro',
    label: 'One Dark Pro',
    shiki: 'one-dark-pro',
    dark: true,
    window: { bg: '#282c34', border: '#3e4451', title: '#abb2bf', muted: '#5c6370' },
    palette: ['#e06c75', '#c678dd', '#98c379'],
  },
  {
    id: 'catppuccin-latte',
    label: 'Catppuccin Latte',
    shiki: 'catppuccin-latte',
    dark: false,
    window: { bg: '#eff1f5', border: '#ccd0da', title: '#5c5f77', muted: '#8c8fa1' },
    palette: ['#8839ef', '#40a02b', '#1e66f5'],
  },
  {
    id: 'catppuccin-mocha',
    label: 'Catppuccin Mocha',
    shiki: 'catppuccin-mocha',
    dark: true,
    window: { bg: '#1e1e2e', border: '#313244', title: '#bac2de', muted: '#7f849c' },
    palette: ['#cba6f7', '#a6e3a1', '#89b4fa'],
  },
  {
    id: 'tokyo-night',
    label: 'Tokyo Night',
    shiki: 'tokyo-night',
    dark: true,
    window: { bg: '#1a1b26', border: '#292e42', title: '#a9b1d6', muted: '#565f89' },
    palette: ['#bb9af7', '#9ece6a', '#7aa2f7'],
  },
  {
    id: 'monokai',
    label: 'Monokai',
    shiki: 'monokai',
    dark: true,
    window: { bg: '#272822', border: '#3e3d32', title: '#f8f8f2', muted: '#90908a' },
    palette: ['#f92672', '#e6db74', '#a6e22e'],
  },
  {
    id: 'night-owl',
    label: 'Night Owl',
    shiki: 'night-owl',
    dark: true,
    window: { bg: '#011627', border: '#1d3b53', title: '#d6deeb', muted: '#4b6479' },
    palette: ['#c792ea', '#ecc48d', '#82aaff'],
  },
  {
    id: 'rose-pine',
    label: 'Rosé Pine',
    shiki: 'rose-pine',
    dark: true,
    window: { bg: '#191724', border: '#26233a', title: '#e0def4', muted: '#6e6a86' },
    palette: ['#31748f', '#f6c177', '#eb6f92'],
  },
  {
    id: 'solarized-light',
    label: 'Solarized Light',
    shiki: 'solarized-light',
    dark: false,
    window: { bg: '#fdf6e3', border: '#ddd6c1', title: '#657b83', muted: '#93a1a1' },
    palette: ['#859900', '#2aa198', '#268bd2'],
  },
  {
    id: 'solarized-dark',
    label: 'Solarized Dark',
    shiki: 'solarized-dark',
    dark: true,
    window: { bg: '#002b36', border: '#0a4252', title: '#93a1a1', muted: '#586e75' },
    palette: ['#859900', '#2aa198', '#268bd2'],
  },
  {
    id: 'vitesse-light',
    label: 'Vitesse Light',
    shiki: 'vitesse-light',
    dark: false,
    window: { bg: '#ffffff', border: '#e7e7e7', title: '#4e4f47', muted: '#9e9e98' },
    palette: ['#1e754f', '#b56959', '#59873a'],
  },
  {
    id: 'vitesse-dark',
    label: 'Vitesse Dark',
    shiki: 'vitesse-dark',
    dark: true,
    window: { bg: '#121212', border: '#2a2a2a', title: '#bfbaaa', muted: '#6b6b66' },
    palette: ['#4d9375', '#c98a7d', '#80a665'],
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
