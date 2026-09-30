# Contributing

Thanks for helping with CodePic. Small fixes can go straight to a pull request. For anything
bigger, open an issue first so the idea can be discussed before you spend time on it.

## Set up

You need Node 22 or newer and [pnpm](https://pnpm.io). The version is pinned in `package.json`.

```sh
pnpm install
pnpm dev
```

Before you open a pull request, run:

```sh
pnpm check   # formatting, lint and types
pnpm test    # unit tests
pnpm build   # production build
```

CI runs the same checks. The command line tool lives in `packages/cli` and builds with
`pnpm run cli:build`.

## Where things go

The README has a map of `src/`. New code goes into the folder for its concern, such as `lib/marks`
or `lib/share`, and a component or module should do one job.

## Guidelines

- Keep the change small and in the right place. A fix belongs in the shared function, not in one caller.
- Reuse what the project already has before adding a helper or a dependency.
- Comment only what the code cannot say by itself.
- Add or update tests for behavior you change.
- Keep the privacy promise: no accounts, no uploads, no server, and the code is never stored.

## Commits and pull requests

- One purpose per pull request.
- Commit messages are one line in the [Conventional Commits](https://www.conventionalcommits.org)
  style, such as `fix(share): keep marks in old links`. A git hook checks this when you commit, and
  the pull request title has to follow it too.
- Link the issue with `Closes #123` in the pull request description.

By contributing you agree that your work is released under the [MIT license](LICENSE), and you agree
to follow the [code of conduct](CODE_OF_CONDUCT.md).
