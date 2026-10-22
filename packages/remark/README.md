# remark-codepic

A [remark](https://github.com/remarkjs/remark) plugin that turns marked code blocks into [CodePic](https://codepic.kitdev.space/) images when your site builds. It runs the `codepic` command line tool on your machine. Nothing is uploaded.

This package is not on npm yet. From a checkout, run `vpr remark:build` and `vpr cli:build`.

## Use

`codepic` is a peer dependency, so install it next to the plugin:

```sh
pnpm add remark remark-codepic codepic
```

```js
import { remark } from 'remark';
import remarkCodepic from 'remark-codepic';

const file = await remark()
  .use(remarkCodepic, {
    outDir: 'public/codepic',
    publicPath: '/codepic',
    defaults: { theme: 'nord', bg: 'slate' },
  })
  .process(markdown);
```

The plugin changes only the Markdown tree. A site that makes HTML (for example with Astro or MDX) uses its own remark setup. Add the plugin there.

Mark a code block with `codepic` after the language. The block becomes an image:

````md
```ts codepic theme=dracula alt="The setup function"
export function setup() {}
```
````

## Options

| Option       | Meaning                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------- |
| `outDir`     | Folder for the images. Required. The plugin makes the folder if it is not there               |
| `publicPath` | URL of `outDir` in the built site. Default `/`                                                |
| `format`     | `svg` (default) or `png`                                                                      |
| `defaults`   | Options for every image, with the names of the `codepic` options, such as `{ theme: 'nord' }` |

In the code block, `alt="..."` sets the image text for screen readers. The default is the first line of the code, cut to 100 characters. Other `key=value` pairs are `codepic` options, such as `theme`, `bg`, `width`, `highlight` or `lang`. `codepic --help` lists them all. `format` is not allowed in a block, and `scale` changes only PNG images. A value with spaces needs quotes. An unknown option or a bad value stops the build with an error that names the line.

The language comes from the code block, such as `ts` or `python`. CodePic guesses a language that it does not know from the code. Set `lang=` to choose it.

Each image file name is a hash of the code, the options and the `codepic` version. The plugin does not draw a file again if it is there, so you can keep `outDir` between builds. The plugin does not remove old files.
