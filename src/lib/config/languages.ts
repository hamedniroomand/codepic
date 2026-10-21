export type LanguageDef = { id: string; label: string; shiki: string };

export const LANGUAGES: LanguageDef[] = [
  { id: 'javascript', label: 'JavaScript', shiki: 'javascript' },
  { id: 'typescript', label: 'TypeScript', shiki: 'typescript' },
  { id: 'html', label: 'HTML', shiki: 'html' },
  { id: 'css', label: 'CSS', shiki: 'css' },
  { id: 'json', label: 'JSON', shiki: 'json' },
  { id: 'shell', label: 'Shell', shiki: 'bash' },
  { id: 'python', label: 'Python', shiki: 'python' },
  { id: 'go', label: 'Go', shiki: 'go' },
  { id: 'php', label: 'PHP', shiki: 'php' },
  { id: 'sql', label: 'SQL', shiki: 'sql' },
  { id: 'java', label: 'Java', shiki: 'java' },
  { id: 'csharp', label: 'C#', shiki: 'csharp' },
  { id: 'rust', label: 'Rust', shiki: 'rust' },
  { id: 'markdown', label: 'Markdown', shiki: 'markdown' },
  { id: 'jsx', label: 'JSX', shiki: 'jsx' },
  { id: 'tsx', label: 'TSX', shiki: 'tsx' },
  { id: 'c', label: 'C', shiki: 'c' },
  { id: 'cpp', label: 'C++', shiki: 'cpp' },
  { id: 'kotlin', label: 'Kotlin', shiki: 'kotlin' },
  { id: 'swift', label: 'Swift', shiki: 'swift' },
  { id: 'ruby', label: 'Ruby', shiki: 'ruby' },
  { id: 'yaml', label: 'YAML', shiki: 'yaml' },
  { id: 'toml', label: 'TOML', shiki: 'toml' },
  { id: 'dockerfile', label: 'Dockerfile', shiki: 'docker' },
  { id: 'svelte', label: 'Svelte', shiki: 'svelte' },
  { id: 'vue', label: 'Vue', shiki: 'vue' },
  { id: 'plaintext', label: 'Plain Text', shiki: 'text' },
];

export function languageShikiId(id: string): string {
  return LANGUAGES.find((l) => l.id === id)?.shiki ?? 'text';
}
