<!-- shields.io badge used because pkg.pr.new/badge returns HTTP 404 status despite valid SVG content, causing GitHub's image proxy to fail -->

[![pkg.pr.new](https://img.shields.io/badge/pkg.pr.new-Effect--TS%2Feffect--smol-black)](https://pkg.pr.new/~/Effect-TS/effect-smol)

# Purchase

`@effect-x/purchase` is a provider-neutral payment SDK for Effect applications. It is being built for small studios and product teams that run multiple apps and want one shared commercial runtime instead of re-implementing Stripe and Paddle details in every project.

The target product shape is:

- one catalog DSL for subscriptions, one-time purchases, and credits
- one workflow runtime for checkout, webhooks, entitlements, refunds, and portals
- multiple provider backends behind the same API
- embeddable storage and schema integration for app-owned databases

## Repository Layout

- `packages/purchase`: SDK package
- `examples/nextjs`: runnable integration example
- `docs`: documentation site

## Current Focus

The SDK already contains a substantial core: provider adapters, catalog sync, checkout workflows, webhook normalization/replay, snapshots, credits, and portal flows. What it still needs before it feels like a widely usable open-source payment system is stronger onboarding, a tighter public API, production-grade setup/migration ergonomics, and clearer release guarantees.

The implementation roadmap now lives in the docs site:

- `docs/content/docs/roadmap.mdx`

## Local Development

```bash
pnpm install
pnpm --filter @effect-x/purchase-nextjs dev
pnpm --filter @effect-x/purchase-docs dev
```

## Operator Workflows

### Paddle Vendor Session Capture

Paddle checkout settings currently require a vendor web session for the private vendor GraphQL API. Keep these values local only; `.env.local` is ignored by git.

1. Install the Playwright browser matching `packages/purchase`'s `playwright-core` version.

```bash
pnpm paddle-vendor:install
```

2. Add sandbox vendor credentials to `.env.local` at the repository root.

```env
PADDLE_SANDBOX_EMAIL=seller@example.com
PADDLE_SANDBOX_PASSWORD=change-me
```

3. Capture a fresh session.

```bash
pnpm paddle-vendor:capture
```

The capture script writes `.purchase/paddle-vendor-sandbox-session.json` from `packages/purchase` by default. Override with `PADDLE_VENDOR_SESSION_FILE` when needed. Use `PADDLE_VENDOR_HEADLESS=1` for headless browser capture.

4. Run Paddle vendor GraphQL research scripts when inspecting checkout settings or mutation payloads.

```bash
pnpm research:paddle-vendor
pnpm research:paddle-vendor:mutations
```

### Purchase CLI

The public CLI entry point is `packages/purchase/src/bin.ts` and exposes these command groups:

- `pay prepare`: plans or applies provider setup such as checkout URL and webhook settings.
- `pay catalog sync`: plans or applies catalog synchronization against Stripe or Paddle plus the local projection database.

Common verification commands for this workflow:

```bash
pnpm --filter @effect-x/purchase test test/cli.test.ts test/catalog-sync.test.ts test/paddle-vendor-session.test.ts
pnpm check
```
