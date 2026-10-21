import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Code, Image, Paragraph, Parent, Root } from 'mdast';

import { LANGUAGES } from '$lib/config/languages';
import { APPEARANCE_PARAMS } from '$lib/share/open-params';

/** Draws one image. The default runs the `codepic` command line tool. */
export type Render = (code: string, args: string[]) => Promise<void>;

export type Options = {
  /** Folder for the images. It is made when it does not exist. */
  outDir: string;
  /** URL of `outDir` in the built site. Default `/`. */
  publicPath?: string;
  /** Image format. Default `svg`. */
  format?: 'svg' | 'png';
  /** Options for every image, with the names of the command line options, such as `{ theme: 'nord' }`. */
  defaults?: Record<string, string>;
  /** For tests. */
  render?: Render;
};

const MARKER = 'codepic';
// The plugin's own `format` option sets the file type, so a block cannot change it.
const BLOCK_OPTIONS = APPEARANCE_PARAMS.filter((name) => name !== 'format');

// Short names that Markdown code blocks often use.
const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  console: 'shell',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  cs: 'csharp',
  kt: 'kotlin',
  'c++': 'cpp',
  yml: 'yaml',
  md: 'markdown',
  docker: 'dockerfile',
  text: 'plaintext',
  txt: 'plaintext',
};

/** The CodePic language for a code block, or null so the command line tool guesses it. */
export function blockLanguage(lang: string | null | undefined): string | null {
  if (!lang) return null;
  const id = LANGUAGE_ALIASES[lang.toLowerCase()] ?? lang.toLowerCase();
  return LANGUAGES.some((language) => language.id === id) ? id : null;
}
// key=value or key="value with spaces"
const META_OPTION = /([\w-]+)=(?:"([^"]*)"|(\S+))/g;

/** Reads `codepic theme=nord alt="Setup"` from the code block meta. Null when the marker is not there. */
export function parseMeta(meta: string | null | undefined): Record<string, string> | null {
  if (
    !meta ||
    !meta
      .replace(/"[^"]*"/g, '')
      .split(/\s+/)
      .includes(MARKER)
  )
    return null;
  const options: Record<string, string> = {};
  for (const [, key, quoted, plain] of meta.matchAll(META_OPTION)) options[key] = quoted ?? plain;
  return options;
}

/**
 * Arguments for the command line tool. Only appearance options pass, so a code block can never
 * set the input file or the output path. Values never become separate flags.
 */
export function cliArgs(options: Record<string, string>): string[] {
  const args: string[] = [];
  for (const [key, value] of Object.entries(options)) {
    if (!BLOCK_OPTIONS.includes(key)) {
      throw new Error(`Unknown option "${key}". Use one of: alt, ${BLOCK_OPTIONS.join(', ')}.`);
    }
    args.push(`--${key}=${value}`);
  }
  return args;
}

function cliManifest(): { file: string; bin: string; version: string } {
  const file = fileURLToPath(import.meta.resolve('codepic/package.json'));
  const { bin, version } = JSON.parse(readFileSync(file, 'utf8')) as {
    bin: Record<string, string>;
    version: string;
  };
  return { file, bin: bin.codepic, version };
}

const runCli: Render = (code, args) =>
  new Promise((resolve, reject) => {
    const { file, bin } = cliManifest();
    const child = execFile(
      process.execPath,
      [join(file, '..', bin), ...args],
      (error, _stdout, stderr) => {
        if (error) reject(new Error(stderr.trim() || error.message));
        else resolve();
      },
    );
    // The tool can stop before it reads all of the code, for example on a bad option.
    // The exit status reports that, so a broken pipe here is not a second error.
    child.stdin?.on('error', () => {});
    child.stdin?.end(code);
  });

/** Runs the jobs with at most `limit` at the same time. */
async function runLimited(jobs: (() => Promise<void>)[], limit: number): Promise<void> {
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < jobs.length) await jobs[next++]();
  };
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, worker));
}

function isCode(node: { type: string }): node is Code {
  return node.type === 'code';
}

function isMissing(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException).code;
  return code === 'ENOENT' || code === 'ENOTDIR';
}

function exists(file: string): boolean {
  try {
    statSync(file);
    return true;
  } catch (error) {
    if (isMissing(error)) return false;
    throw error;
  }
}

export default function remarkCodepic(options: Options) {
  const { outDir, publicPath = '/', format = 'svg', defaults = {}, render = runCli } = options;
  const base = publicPath.endsWith('/') ? publicPath : `${publicPath}/`;
  // A new version of the tool can draw a different image, so it is part of each file name.
  const version = render === runCli ? cliManifest().version : '';

  return async (tree: Root): Promise<void> => {
    const jobs = new Map<string, () => Promise<void>>();
    const walk = (parent: Parent): void => {
      parent.children.forEach((node, index) => {
        if (isCode(node)) {
          const meta = parseMeta(node.meta);
          if (!meta) return;
          const fail = (error: unknown): never => {
            const where = node.position ? ` at line ${node.position.start.line}` : '';
            throw new Error(
              `codepic${where}: ${error instanceof Error ? error.message : String(error)}`,
            );
          };
          const lang = blockLanguage(node.lang);
          const merged: Record<string, string> = {
            ...defaults,
            ...(lang ? { lang } : {}),
            ...meta,
          };
          const { alt, ...look } = merged;
          let args: string[] = [];
          try {
            args = cliArgs(look);
          } catch (error) {
            fail(error);
          }
          const key = createHash('sha256')
            .update(JSON.stringify([node.value, look, format, version]))
            .digest('hex')
            .slice(0, 16);
          const name = `codepic-${key}.${format}`;
          const file = join(outDir, name);
          // The name is a hash of everything that changes the image, so an existing file is
          // up to date. The tool writes to a temporary name first, so a stopped build never
          // leaves a broken file under the final name.
          if (!jobs.has(name) && !exists(file)) {
            jobs.set(name, async () => {
              const temp = join(outDir, `.${name}.${process.pid}.${format}`);
              mkdirSync(outDir, { recursive: true });
              try {
                await render(node.value, [...args, `--output=${temp}`]);
                renameSync(temp, file);
              } catch (error) {
                rmSync(temp, { force: true });
                fail(error);
              }
            });
          }
          const image: Image = {
            type: 'image',
            url: `${base}${name}`,
            alt: alt ?? node.value.split('\n')[0].trim().slice(0, 100),
          };
          const paragraph: Paragraph = { type: 'paragraph', children: [image] };
          parent.children[index] = paragraph;
        } else if ('children' in node) {
          walk(node as Parent);
        }
      });
    };
    walk(tree);
    await runLimited([...jobs.values()], availableParallelism());
  };
}
