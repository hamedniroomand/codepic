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
  jsx: `export default function App() {\n  return (\n    <div className="app">\n      <Header title="Hi" />\n    </div>\n  );\n}`,
  tsx: `type Props = { title: string };\nexport const Header = ({ title }: Props) => {\n  return <h1 className="title">{title}</h1>;\n};`,
  c: `#include <stdio.h>\n\nint main(void) {\n  printf("hi\\n");\n  return 0;\n}`,
  cpp: `#include <iostream>\n\nint main() {\n  std::cout << "hi" << std::endl;\n  return 0;\n}`,
  kotlin: `data class User(val name: String)\n\nfun main() {\n    val user = User("hi")\n    println(user.name)\n}`,
  swift: `import SwiftUI\n\nstruct ContentView: View {\n    var body: some View {\n        Text("Hello")\n    }\n}`,
  ruby: `require 'json'\n\nclass Greeter\n  attr_reader :name\n\n  def hello\n    puts "hi #{name}"\n  end\nend`,
  yaml: `name: CI\non:\n  push:\n    branches: [main]\njobs:\n  build:\n    steps:\n      - name: Install\n        run: npm ci`,
  toml: `[package]\nname = "codepic"\nversion = "0.1.0"\n\n[dependencies]\nserde = "1"`,
  dockerfile: `FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci\nCMD ["node", "server.js"]`,
  vue: `<template>\n  <button @click="count++">{{ count }}</button>\n</template>\n\n<script setup>\nimport { ref } from 'vue';\nconst count = ref(0);\n</script>`,
  svelte: `<script>\n  let count = $state(0);\n</script>\n\n{#if count > 0}\n  <p>{count}</p>\n{/if}\n<button onclick={() => count++}>Add</button>`,
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

test('a short key and value line stays plain text', () => {
  expect(detectLanguage('Note: call me later')).toBe('plaintext');
  expect(detectLanguage('x = 1')).toBe('plaintext');
});

test('typed code with generics stays TypeScript', () => {
  expect(
    detectLanguage(
      'async function load(): Promise<User> {\n  const r: Response = await fetch(url);\n  return r.json();\n}',
    ),
  ).toBe('typescript');
});

test('notes and Python blocks are not mistaken for YAML', () => {
  expect(detectLanguage('Notes:\nTodo: buy milk')).toBe('plaintext');
  expect(detectLanguage('try:\n    run()\nexcept:\n    pass')).not.toBe('yaml');
});
