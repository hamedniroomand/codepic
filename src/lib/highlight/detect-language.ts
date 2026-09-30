// Ponytail: keyword scoring only, so mixed-language files and one-liners can miss.
// Upgrade path: swap in a small trained classifier if real pastes outgrow the rules.

type Signal = [weight: number, pattern: RegExp];

const SAMPLE_CHARS = 8_000;
const MIN_SCORE = 3;
const MIN_LEAD = 2;

const SIGNALS: Record<string, Signal[]> = {
  html: [
    [5, /<!DOCTYPE\s+html/i],
    [4, /<\/?(?:html|head|body|div|span|section|nav|ul|li|p|a)\b/i],
    [3, /<[a-z][\w-]*(?:\s+[\w:-]+="[^"]*")*\s*\/?>/i],
  ],
  css: [
    [4, /@(?:media|keyframes|import|font-face)\b/],
    [3, /[.#]?[\w-]+\s*\{[^}]*[a-z-]+\s*:\s*[^;]+;/],
    [2, /\b(?:margin|padding|color|display|flex|grid|font-size)\s*:/],
  ],
  json: [
    [2, /^\s*[[{]/],
    [2, /"(?:[^"\\]|\\.)*"\s*:/],
  ],
  python: [
    [4, /^\s*(?:async\s+)?def\s+\w+\s*\(/m],
    [4, /^\s*class\s+\w+\s*[(:]/m],
    [3, /^\s*(?:from\s+\S+\s+import|import\s+\w+)/m],
    [3, /\b(?:elif|except|yield|self\.)/],
    [2, /\bprint\s*\(/],
  ],
  go: [
    [5, /^\s*package\s+\w+/m],
    [4, /\bfunc\s+(?:\([^)]*\)\s*)?\w+\s*\(/],
    [3, /\b(?:fmt|http|json)\.\w+/],
    [3, /:=/],
  ],
  php: [
    [5, /<\?php\b/],
    [3, /\$\w+\s*(?:->|=)/],
    [2, /\b(?:echo|elseif|endif|endforeach)\b/],
    [2, /\bnamespace\s+[\w\\]+;/],
  ],
  sql: [
    [4, /\bSELECT\b[\s\S]+?\bFROM\b/i],
    [3, /\b(?:INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i],
    [3, /\b(?:CREATE|ALTER|DROP)\s+TABLE\b/i],
    [2, /\b(?:WHERE|JOIN|GROUP\s+BY|ORDER\s+BY|LIMIT)\b/i],
  ],
  java: [
    [4, /\bpublic\s+(?:class|interface|enum)\s+\w+/],
    [4, /\bSystem\.(?:out|err)\./],
    [3, /\bpublic\s+static\s+void\s+main\s*\(/],
    [2, /\b(?:@Override|ArrayList|HashMap)\b/],
    [2, /\bimport\s+java\./],
  ],
  csharp: [
    [5, /\busing\s+System\b/],
    [4, /\bnamespace\s+[\w.]+\s*[;{]/],
    [3, /\bConsole\.Write(?:Line)?\s*\(/],
    [3, /\basync\s+Task\b|\bIEnumerable</],
    [2, /\{\s*get;/],
  ],
  rust: [
    [4, /\bfn\s+\w+\s*(?:<[^>]+>)?\s*\(/],
    [4, /\b(?:let\s+mut|impl\s|pub\s+fn|use\s+std::)/],
    [3, /\bprintln!\s*\(/],
    [3, /->\s*(?:Result|Option|Self|&str)\b/],
    [2, /\bmatch\s+\w+\s*\{/],
  ],
  shell: [
    [5, /^#!\s*\/(?:usr\/)?bin\/(?:env\s+)?(?:ba|z|fi|da|k)?sh\b/m],
    [3, /\b(?:echo|export|source)\s+/],
    [3, /\bif\s+\[\s+/],
    [2, /\b(?:then|fi|esac|done)\b/],
    [2, /\$\{?\w+\}?/],
  ],
  javascript: [
    [3, /\b(?:const|let|var)\s+\w+\s*=/],
    [3, /\bfunction\s+\w+\s*\(/],
    [3, /\bconsole\.(?:log|error|warn)\s*\(/],
    [2, /=>\s*[{(]/],
    [2, /\b(?:require\s*\(|module\.exports|export\s+(?:default|const|function))/],
  ],
  markdown: [
    [4, /^#{1,6}\s+\S+/m],
    [3, /^```[\w-]*$/m],
    [3, /\[[^\]]+\]\([^)]+\)/],
    [2, /^\s*(?:[-*+]|\d+\.)\s+\S+/m],
  ],
};

// Typed syntax that plain JavaScript never uses. TypeScript is JavaScript plus these.
const TYPESCRIPT_ONLY: Signal[] = [
  [5, /\b(?:interface|type|enum)\s+\w+/],
  [4, /:\s*(?:string|number|boolean|void|any|unknown|never|Record<|Promise<)/],
  [3, /\bas\s+const\b|\bas\s+[A-Z]\w*/],
  [3, /\b(?:readonly|implements|declare)\b/],
];

function isJson(text: string): boolean {
  if (!/^[[{]/.test(text)) return false;
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function score(sample: string, signals: Signal[]): number {
  return signals.reduce((sum, [weight, pattern]) => sum + (pattern.test(sample) ? weight : 0), 0);
}

/** Guesses a supported language. Weak or ambiguous code comes back as plain text. */
export function detectLanguage(code: string): string {
  const sample = code.slice(0, SAMPLE_CHARS);
  const scores = new Map(
    Object.entries(SIGNALS).map(([id, signals]) => [id, score(sample, signals)]),
  );

  if (isJson(code.trim())) scores.set('json', (scores.get('json') ?? 0) + 8);
  const typed = score(sample, TYPESCRIPT_ONLY);
  if (typed) scores.set('typescript', (scores.get('javascript') ?? 0) + typed);

  const [[best, top], runnerUp] = [...scores].sort((a, b) => b[1] - a[1]);
  return top >= MIN_SCORE && top - runnerUp[1] >= MIN_LEAD ? best : 'plaintext';
}
