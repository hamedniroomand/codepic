import { expect, test } from 'vite-plus/test';

import { LANGUAGES } from '$lib/config/languages';

import { detectLanguage } from './detect-language';

const SNIPPETS: Record<string, string> = {
  javascript: `const greet = (name) => {\n  console.log(\`Hello, \${name}\`);\n};\ngreet('CodePic');`,
  typescript: `interface User {\n  id: number;\n  name: string;\n}\nexport const greet = (user: User): string => user.name;`,
  html: `<!DOCTYPE html>\n<html>\n  <body>\n    <div class="app"><p>Hello</p></div>\n  </body>\n</html>`,
  css: `.card {\n  display: flex;\n  margin: 0 auto;\n}\n@media (min-width: 600px) {\n  .card { padding: 8px; }\n}`,
  json: `{\n  "name": "codepic",\n  "private": true,\n  "tags": ["a", "b"]\n}`,
  shell: `#!/usr/bin/env bash\nset -e\nexport PORT=3000\nif [ -z "$HOME" ]; then\n  echo "no home"\nfi`,
  python: `import os\n\nclass Greeter:\n    def hello(self, name):\n        print(f"hi {name}")\n        return self.name`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n  msg := "hi"\n  fmt.Println(msg)\n}`,
  php: `<?php\nnamespace App;\n$user = new User();\necho $user->name;`,
  sql: `SELECT u.id, u.name\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE o.total > 10\nORDER BY u.name;`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("hi");\n  }\n}`,
  csharp: `using System;\n\nnamespace Demo {\n  class Program {\n    static void Main() { Console.WriteLine("hi"); }\n  }\n}`,
  rust: `use std::fmt;\n\nfn add(a: i32, b: i32) -> i32 {\n    let mut sum = a;\n    sum += b;\n    println!("{}", sum);\n    sum\n}`,
  markdown: `# Title\n\nSome text with a [link](https://example.com).\n\n- one\n- two`,
};

test.each(Object.entries(SNIPPETS))('detects %s', (id, code) => {
  expect(detectLanguage(code)).toBe(id);
});

test('has a sample for every language that can be detected', () => {
  const detectable = LANGUAGES.map((l) => l.id).filter((id) => id !== 'plaintext');
  expect(Object.keys(SNIPPETS).sort()).toEqual(detectable.sort());
});

test('falls back to plain text when the guess is weak', () => {
  expect(detectLanguage('just some words in a row')).toBe('plaintext');
  expect(detectLanguage('42')).toBe('plaintext');
  expect(detectLanguage('   ')).toBe('plaintext');
});

test('plain JavaScript is not mistaken for TypeScript', () => {
  expect(detectLanguage('const total = items.reduce((a, b) => a + b, 0);')).toBe('javascript');
});
