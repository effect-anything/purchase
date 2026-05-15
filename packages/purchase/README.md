# @effect-x/purchase

Provider-neutral payment SDK for Effect applications.

It is designed for teams that run multiple products and want one commercial runtime that hides provider-specific implementation details behind a stable catalog and workflow API. The current focus is a shared SDK that can model and run:

- subscriptions
- one-time purchases
- prepaid credits

The SDK currently targets Stripe and Paddle and exposes a catalog-driven runtime for checkout, webhook ingestion, replay, customer snapshots, entitlements, credits, refunds, and portal sessions.

## Public Imports

Use the root package import as the stable application entrypoint. The preferred
runtime helpers are `PurchaseSDK` and `PurchaseProvider`; compatibility aliases
for `BaseSDK` and `PayProvider` remain available.

```ts
import {
  CustomerId,
  Paddle,
  PurchaseProvider,
  PurchaseSDK,
  Stripe,
  featureFlag,
  plan,
  subscriptionProduct
} from "@effect-x/purchase"
```

The intentionally supported narrow subpaths for this release are:

- `@effect-x/purchase/db` for storage adapter and override types
- `@effect-x/purchase/dsl` for catalog DSL helpers
- `@effect-x/purchase/errors` for legacy provider/runtime error classes
- `@effect-x/purchase/paddle` for the Paddle provider layer
- `@effect-x/purchase/provider` for provider tags, config, and selection helpers
- `@effect-x/purchase/schema` for public schema classes and workflow types
- `@effect-x/purchase/sdk` for the purchase SDK runtime types and helpers
- `@effect-x/purchase/stripe` for the Stripe provider layer
- `@effect-x/purchase/tables` for package-owned storage table models

Internal implementation paths and implicit wildcard subpaths are not part of the consumer contract.

## Testing Strategy

`purchase` uses a layered payment testing model:

- `test/core/*`: internal catalog, projection, workflow, entitlement, ledger, and capability tests with stubbed providers.
- `test/provider/*`: provider adapter and webhook normalization tests using generated fixtures and mocked SDK boundaries.
- `e2e/provider-live/*`: small real-provider contract tests against Stripe test mode or Paddle sandbox.
- App/browser smoke coverage should stay minimal and should not be the main billing correctness layer.

Shared provider-live utilities live under [test/support/provider-live-harness.ts](./test/support/provider-live-harness.ts) and standardize:

- `createTestCustomer(...)`
- `attachTestPaymentMethod(...)`
- `advanceProviderTime(...)`
- `dispatchWebhookFixture(...)`
- `createLiveTestHarness(...)`
- `waitForProjectionSettled(...)`

The product-grade real provider end-to-end flow is documented in Chinese at
[e2e/README.md](./e2e/README.md). It defines the global provider setup, webhook
broker, scenario boundaries, and the required coverage for subscription,
one-time purchase, credits, lifecycle, refund, and portal workflows.

## What You Get

- One DSL to describe products, offers, and benefits
- One runtime API for checkout and lifecycle workflows
- Provider-specific layers for Stripe and Paddle
- Storage adapters and override types for embedding into an app schema
- Example Next.js app and docs site in this monorepo

## Quick Start

Install the package alongside Effect:

```bash
pnpm add @effect-x/purchase effect
```

Define a catalog and bind it to an app-local SDK class from the root package entrypoint:

```ts
import { PurchaseSDK, featureFlag, plan, subscriptionProduct } from "@effect-x/purchase"

const premium = featureFlag({ id: "premium_access" })

const plans = [
  plan({
    id: "free",
    group: "main",
    default: true,
    includes: []
  }),
  plan({
    id: "pro_monthly",
    group: "main",
    price: { amount: 12, interval: "month" },
    includes: [premium()],
    provider: {
      stripe: "pro_monthly",
      paddle: "pro_monthly"
    }
  })
] as const

const products = [
  subscriptionProduct("app", {
    name: "App",
    plans
  })
] as const

export class Pay extends PurchaseSDK<Pay, Record<string, never>, typeof plans, typeof products>({
  plans,
  products
}) {}
```

Wire exactly one configured provider layer at your app runtime boundary. Keep
sandbox/test-mode credentials in runtime configuration rather than in the SDK
class so the same catalog can be reused across environments:

```ts
import { Paddle, PurchaseProvider, Stripe } from "@effect-x/purchase"
import { Layer, Redacted } from "effect"

const providerLayer = PurchaseProvider.fromTags({
  paddle: Paddle.layerConfig({
    apiToken: Redacted.make(process.env.PADDLE_API_TOKEN ?? ""),
    webhookToken: Redacted.make(process.env.PADDLE_WEBHOOK_TOKEN ?? ""),
    environment: "sandbox"
  }),
  stripe: Stripe.layerConfig({
    apiToken: Redacted.make(process.env.STRIPE_API_KEY ?? ""),
    webhookToken: Redacted.make(process.env.STRIPE_WEBHOOK_SECRET ?? ""),
    environment: "sandbox"
  })
})

export const PayLayer = Pay.layer(Pay).pipe(Layer.provide(providerLayer))
```

For Stripe runtime wiring, swap in `PurchaseProvider.fromTags({ paddle: Paddle.layer, stripe: Stripe.layer })`
or `PurchaseProvider.FromTags({ paddle: Paddle.layer, stripe: Stripe.layer })`.

The Next.js example follows this same path in
[`examples/nextjs/purchase.ts`](../../examples/nextjs/purchase.ts) and
[`examples/nextjs/context.ts`](../../examples/nextjs/context.ts): the catalog is
bound once, then the app runtime supplies a Paddle sandbox provider layer. Use
`Stripe.layerConfig(...)` with `environment: "sandbox"` for Stripe test-mode
experiments.

Then call the shared workflow API:

```ts
const checkout = Pay.checkout.start({
  customerId,
  offerId: "app:pro_monthly"
})
```

# Current Status

The package already has the core runtime shape and a meaningful test suite, but it is still pre-1.0 and not yet at the level of a broadly adopted open-source billing SDK. The main gaps are around public API hardening, app-framework adapters, migration/setup ergonomics, docs depth, and release discipline.

See the monorepo docs roadmap for the concrete release-readiness plan.

## License

MIT
