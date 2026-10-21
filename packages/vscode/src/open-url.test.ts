import { expect, test } from 'vite-plus/test';
import { URI } from 'vscode-uri';

import { LANGUAGES } from '$lib/config/languages';
import { parseOpenParams } from '$lib/share/open-params';
import { parseShareHash } from '$lib/share/share-url';

import { LANGUAGE_ALIASES, buildOpenUrl, codepicLanguage } from './open-url';

/**
 * Reads the link as the app does, after VS Code passes it to the browser. VS Code parses it
 * into a Uri and opens encodeURI(uri.toString(true)).
 */
type Opened = {
  code: string | null;
  appearance: unknown;
  params: ReturnType<typeof parseOpenParams>;
};

async function openInApp(url: string): Promise<Opened> {
  const sent = new URL(encodeURI(URI.parse(url, true).toString(true)));
  const shared = await parseShareHash(sent.hash);
  return { code: shared.code, appearance: shared.appearance, params: parseOpenParams(sent.search) };
}

test('keeps every character of the code through VS Code and the browser', async () => {
  const code = 'a + b & c # d % e\n\tf = "g?h=i" 50%25 ü 🙂 <x/>';
  const {
    code: received,
    appearance,
    params,
  } = await openInApp(
    await buildOpenUrl({ code, languageId: 'typescript', fileName: 'my file.ts' }),
  );
  expect(received).toBe(code);
  expect(appearance).toBeNull();
  expect(params.errors).toEqual([]);
  expect(params.appearance).toMatchObject({ language: 'typescript', title: 'my file.ts' });
});

test('maps VS Code language ids', async () => {
  const { params } = await openInApp(
    await buildOpenUrl({ code: 'x', languageId: 'typescriptreact', fileName: 'App.tsx' }),
  );
  expect(params.appearance).toMatchObject({ language: 'tsx', title: 'App.tsx' });
});

test('guesses an unknown language and cleans file names it cannot send', async () => {
  const { params } = await openInApp(
    await buildOpenUrl({
      code: 'def run():\n    print(1)',
      languageId: 'cobol',
      fileName: 'a&b+c#d.py',
    }),
  );
  expect(params.errors).toEqual([]);
  expect(params.appearance).toMatchObject({ language: 'python', title: 'a_b_c_d.py' });
  expect(params.appearance.showTitle).toBeUndefined();
});

test('sends names with other characters and cuts long names', async () => {
  for (const fileName of ['Untitled-1', 'ü;x (1).ts', `${'n'.repeat(250)}.ts`]) {
    const { params } = await openInApp(
      await buildOpenUrl({ code: 'x', languageId: 'typescript', fileName }),
    );
    expect(params.errors).toEqual([]);
    expect(params.appearance.title).toBe(fileName.slice(0, 200));
  }
});

test('refuses code that does not fit in a link', async () => {
  let seed = 1;
  const random = Array.from({ length: 40_000 }, () => {
    seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31;
    return String.fromCharCode(33 + (Math.floor(seed / 65_536) % 90));
  }).join('');
  await expect(
    buildOpenUrl({ code: random, languageId: 'plaintext', fileName: 'a.txt' }),
  ).rejects.toThrow('Select a smaller part');
});

test('every alias points at a CodePic language', () => {
  const ids = LANGUAGES.map((language) => language.id);
  for (const id of Object.values(LANGUAGE_ALIASES)) expect(ids).toContain(id);
  expect(codepicLanguage('python', '')).toBe('python');
});
