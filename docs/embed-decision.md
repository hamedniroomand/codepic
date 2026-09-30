# Embed decision

**Decision:** do not build an embed widget. Document two things that already work: a plain
"Open in CodePic" link, and an optional iframe that the host page writes itself.

Closes the research step of [#12](https://github.com/hamedniroomand/codepic/issues/12).

## Evidence

Checked on 2026-09-30.

- Issues: the only one that mentions embedding is #12, the roadmap item that asked for this
  decision. Nobody has asked for an embed.
- Discussions: disabled on the repository.
- Automation is already covered without a widget. Readable URL parameters open the app with code
  and options filled in (#11), a share link carries a whole snapshot, and `npx codepic` draws an
  image from a file with no browser at all.

There is no demand on record, so anything larger than documentation would be built on a guess.

## Options

| Option                                   | Cost                                                                             | Verdict |
| ---------------------------------------- | -------------------------------------------------------------------------------- | ------- |
| Document links and a host-written iframe | A README section. No new code.                                                   | Chosen  |
| A chrome-less `/embed` route             | A second UI mode, sizing and framing quirks, and it still loads the whole app.   | Not now |
| A custom element or npm widget           | A second render path next to the app, a package to version, and the most upkeep. | Not now |

## What the documentation says

- A link with URL parameters or a share link is the recommended way to point readers at CodePic.
- An iframe of the full app works, and is up to the host. The framed page is the whole app, not a
  small viewer. The recipe uses `sandbox="allow-scripts allow-same-origin"` and adds nothing else.
- Framing has not been tested on specific hosts. A host with a strict content security policy must
  allow `codepic.kitdev.space` as a frame source.

## Privacy

The promise stays the same: no account, no upload, no server.

- The framed page runs on the CodePic origin. It stores the look in `localStorage` like a normal
  visit. Code is never stored.
- The host page cannot read what the frame holds, and CodePic sends nothing to the host. No
  `postMessage` bridge is added.
- The site loads its analytics script (`index.html`), and a framed copy loads it too.
- Anything in a link is visible to whoever holds the link: browser history, referrers and logs.
  Keep secrets out of embedded snippets, and use the command line for private code.

## When to reopen

Open a new issue and link it here when any of these becomes true:

1. Someone asks to embed the live editor in a docs site or blog, not just to show an image.
2. A documented workflow needs more than a link, an image or the command line, on a named platform.
3. A target host blocks framing the app and that host matters.
4. A server or accounts are added to the product.

Even then, try an exported image or the command line first.

## Not doing

`/embed`, a custom element, oEmbed, `postMessage`, hosted snippets, and any server component.
