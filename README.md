# Purchase

`@effect-x/purchase` is a provider-neutral payment SDK for Effect applications. It is being built for small studios and product teams that run multiple apps and want one shared commercial runtime instead of re-implementing Stripe and Paddle details in every project.

The target product shape is:

- one catalog DSL for subscriptions, one-time purchases, and credits
- one workflow runtime for checkout, webhooks, entitlements, refunds, and portals
- multiple provider backends behind the same API
- embeddable storage and schema integration for app-owned databases

# Information

- Run commands from the repo root.
- The package manager used is `pnpm`, `node` runtime.
- Avoid `index.ts` barrel files;

## Repository Layout

- `packages/purchase`: SDK package
- `examples/nextjs`: runnable integration example
- `docs`: documentation site
-

## Working Loop

1. Identify the target app or package.
2. Follow local patterns in that directory.
3. Run focused checks/tests for the target.

## Quick Commands

```bash
pnpm check/lint/lint-fix/test
pnpm build
```

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
