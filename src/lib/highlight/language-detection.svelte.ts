import { detectLanguage } from './detect-language';

export type LanguageDetection = {
  /** True while the current language came from detection rather than a choice. */
  readonly detected: boolean;
  /** Call when the user picks a language. Detection stops for the rest of the session. */
  pick: () => void;
  onPaste: (event: ClipboardEvent) => void;
};

export function createLanguageDetection(apply: (language: string) => void): LanguageDetection {
  let picked = false;
  let detected = $state(false);

  function onPaste(event: ClipboardEvent): void {
    const editor = event.target;
    const pasted = event.clipboardData?.getData('text/plain');
    if (picked || !pasted || !(editor instanceof HTMLTextAreaElement)) return;

    const replacesAll =
      !editor.value.trim() ||
      (editor.selectionStart === 0 && editor.selectionEnd === editor.value.length);
    if (!replacesAll) return;

    apply(detectLanguage(pasted));
    detected = true;
  }

  return {
    get detected(): boolean {
      return detected;
    },
    pick(): void {
      picked = true;
      detected = false;
    },
    onPaste,
  };
}
