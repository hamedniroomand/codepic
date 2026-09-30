export type ShortcutAction =
  | 'download'
  | 'copyImage'
  | 'shareLink'
  | 'toggleSettings'
  | 'focusEditor'
  | 'showHelp';

export type Shortcut = {
  action: ShortcutAction;
  label: string;
  key: string;
  shift?: boolean;
};

// Every shortcut needs Ctrl or ⌘, so none can clash with typing or with the
// single letter keys screen readers use to move around a page.
export const SHORTCUTS: readonly Shortcut[] = [
  { action: 'download', label: 'Download image', key: 'Enter' },
  { action: 'copyImage', label: 'Copy image', key: 'Enter', shift: true },
  { action: 'shareLink', label: 'Copy share link', key: 'l', shift: true },
  { action: 'toggleSettings', label: 'Open image settings', key: '.' },
  { action: 'focusEditor', label: 'Focus the editor', key: 'e', shift: true },
  { action: 'showHelp', label: 'Show keyboard shortcuts', key: '/' },
];

export const HELP_PANEL_ID = 'shortcuts-panel';

type KeyEvent = Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>;

export function matchShortcut(event: KeyEvent): ShortcutAction | null {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return null;
  const key = event.key.toLowerCase();
  const match = SHORTCUTS.find(
    (shortcut) => shortcut.key.toLowerCase() === key && Boolean(shortcut.shift) === event.shiftKey,
  );
  return match?.action ?? null;
}

export function formatShortcut({ key, shift }: Shortcut, mac: boolean): string {
  const parts = [
    mac ? '⌘' : 'Ctrl',
    ...(shift ? [mac ? '⇧' : 'Shift'] : []),
    key.length === 1 ? key.toUpperCase() : key,
  ];
  return parts.join(mac ? '' : '+');
}
