# @effect-x/db

Schema-bound database helpers for Effect applications.

## Install

```bash
pnpm add @effect-x/db effect
```

## Entrypoints

- `@effect-x/db`
- `@effect-x/db/kysely`
- `@effect-x/db/migrator`
- `@effect-x/db/prisma`
- `@effect-x/db/schema`
- `@effect-x/db/markdown/*`

## Quick Start

Create a new repository from this template, then replace the package metadata in `package.json`:

- change `name`, `description`, `repository`, `bugs`, and `homepage`
- update `README.md` to describe the real package
- keep `packageManager`, `publishConfig`, and the shared quality scripts unless you have a good reason to diverge

Install dependencies and run the baseline checks:

```bash
bun install
bun run check
```

## Project Layout

```text
src/
  index.ts
tests/
  index.test.ts
  package-metadata.test.ts
```

The default template ships only a library entrypoint. `tsdown` produces `dist/index.js` and `dist/index.d.ts`.

## Development

Useful commands:

```bash
bun run dev
bun run test
bun run build
bun run pack:check
```

## Release

This repository uses Changesets plus the bundled GitHub Actions release workflow.

```bash
bun run changeset
bun run version-packages
bun run release
```

## Optional CLI Mode

If a package also needs a CLI, keep Node.js as the published runtime for the executable.

1. add `src/cli.ts` with a Node shebang such as `#!/usr/bin/env node`
2. extend `tsdown.config.ts` to build a `cli` entry
3. add a `bin` field in `package.json`
4. keep Bun for local development, but test the generated `dist/cli.js` with Node

## License

MIT
