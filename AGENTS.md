This is the Purchase SDK library repository, focusing on functional programming patterns and effect systems in TypeScript.

- The git base branch is `main`
- Use `pnpm` as the package manager
- Run `pnpm lint-fix` after editing files
- Always run tests after making changes: `pnpm test <test_file.ts>`
- Run type checking: `pnpm check`
  - If type checking continues to fail, run `pnpm clean` to clear caches, then re-run `pnpm check`

# Information

- Run commands from the monorepo root.
- Use Jujutsu instead of git in this workspace,
- The package manager used is pnpm.
- Avoid `index.ts` barrel files;

## Structure

- `docs/` `examples` : applications (web, docs)
- `packages/`: shared libraries

## Working Loop

1. Identify the target app or package.
2. Follow local patterns in that directory.
3. Run focused checks/tests for the target.

## Engineering Principles

- **Proactive Progress**: Don't wait for instructions. Identify blockers, propose solutions, and push work forward autonomously.
- **Robust & Scalable**: Prefer solutions that work reliably and can grow. Avoid fragile hacks that break under load.
- **Globally Optimal**: Consider the whole system, not just the immediate fix. Trade-offs should be conscious and documented.
- **Verify Reality**: Test assumptions. A working demo beats a perfect plan.
- **Ship & Iterate**: Perfect is the enemy of done. Get to working state, then improve.
