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
