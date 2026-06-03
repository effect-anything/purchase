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

## Quick Commands

```bash
pnpm check
pnpm lint
pnpm lint-fix
pnpm test
pnpm build
pnpm test-types
```

## Working Loop

1. Identify the target app or package.
2. Follow local patterns in that directory.
3. Run focused checks/tests for the target.

# TypeScript Preflight Rule

- Before any TypeScript planning, multi-file edit, refactor, or architecture question, load the `architecture-preflight` skill first. Re-run it after substantial changes to verify alignment.
- Trigger on: definitions, types, signatures, exports, services, layers, schemas, wiring, module boundaries, or broad source reading.
- Posture: inspect declarations/signatures first, then narrow to implementation files only as needed.

# Specifications

To learn more about previous and current specifications for this project, see
the `.specs/README.md` file.

# Learning more about the "effect" & "@effect/\*" packages

- `.references/effect/README.md` is an authoritative source of information about the
- "effect" and "@effect/\*" packages. Read this before looking elsewhere for information about these packages. It contains the best practices for using effect.

Use this for learning more about the library, rather than browsing the code in
`node_modules/`.

## Engineering Principles

- **Proactive Progress**: Don't wait for instructions. Identify blockers, propose solutions, and push work forward autonomously.
- **Robust & Scalable**: Prefer solutions that work reliably and can grow. Avoid fragile hacks that break under load.
- **Globally Optimal**: Consider the whole system, not just the immediate fix. Trade-offs should be conscious and documented.
- **Verify Reality**: Test assumptions. A working demo beats a perfect plan.
- **Ship & Iterate**: Perfect is the enemy of done. Get to working state, then improve.
