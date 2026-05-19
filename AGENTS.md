## Project Introduction

`purchase` is the Purchase SDK monorepo, focused on TypeScript libraries and applications built around functional and Effect-oriented patterns.

# Information

- The git base branch is `main`.
- Run commands from the monorepo root.
- Use Jujutsu instead of git in this workspace,
- The package manager used is `pnpm`.
- Use the Node runtime for repository scripts unless a package explicitly documents otherwise.
- Run `pnpm lint-fix` after editing files.
- Always run tests after making changes: `pnpm test <test_file.ts>` when targeting a specific test.
- Run type checking with `pnpm check`.
  - If type checking continues to fail, run `pnpm clean` to clear caches, then re-run `pnpm check`.
- Avoid `index.ts` barrel files;

## Structure

- `docs/` `examples` : applications (web, docs)
- `packages/`: shared libraries

## Working Loop

1. Identify the target app or package.
2. Follow local patterns in that directory.
3. Run focused checks/tests for the target.

## TypeScript Preflight Rule

- Before any TypeScript planning, multi-file edit, refactor, or architecture question, load the `architecture-preflight` skill first. Re-run it after substantial changes to verify alignment.
- Trigger on: definitions, types, signatures, exports, services, layers, schemas, wiring, module boundaries, or broad source reading.
- Posture: inspect declarations/signatures first, then narrow to implementation files only as needed.

## Quick Commands

```bash
pnpm check
pnpm lint
pnpm lint-fix
pnpm test
pnpm build
pnpm test-types
```

# Specifications

To learn more about previous and current specifications for this project, see
the `.specs/README.md` file if it exists.

# Learning from reference repositories

- `.references/` contains reference repositories and supporting materials for this project. Treat it as the first place to look when you need examples, patterns, prior art, or library-specific guidance.
- When working with `effect` or `@effect/*`, prefer `.references/effect/README.md` first when available. It is the authoritative guide in this repo for Effect usage and best practices.
- More generally, do not limit reference lookup to Effect only: check other relevant projects under `.references/` whenever they better match the problem you are solving.
- Prefer learning from `.references/` over browsing generated build output or digging through `node_modules/`, unless you specifically need implementation-level confirmation.

## Engineering Principles

- **Proactive Progress**: Don't wait for instructions. Identify blockers, propose solutions, and push work forward autonomously.
- **Robust & Scalable**: Prefer solutions that work reliably and can grow. Avoid fragile hacks that break under load.
- **Globally Optimal**: Consider the whole system, not just the immediate fix. Trade-offs should be conscious and documented.
- **Verify Reality**: Test assumptions. A working demo beats a perfect plan.
- **Ship & Iterate**: Perfect is the enemy of done. Get to working state, then improve.
