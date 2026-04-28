# @effect-x/purchase

Provider-neutral payment SDK for Effect applications.

It is designed for teams that run multiple products and want one commercial runtime that hides provider-specific implementation details behind a stable catalog and workflow API. The current focus is a shared SDK that can model and run:

- subscriptions
- one-time purchases
- prepaid credits

The SDK currently targets Stripe and Paddle and exposes a catalog-driven runtime for checkout, webhook ingestion, replay, customer snapshots, entitlements, credits, refunds, and portal sessions.

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

## What You Get

- One DSL to describe products, offers, and benefits
- One runtime API for checkout and lifecycle workflows
- Provider-specific layers for Stripe and Paddle
- Storage adapters and override types for embedding into an app schema
- Example Next.js app and docs site in this monorepo

## Quick Start

Install the package and one provider integration:

```bash
pnpm add @effect-x/purchase effect
```

Define a catalog:

```ts
import { BaseSDK, featureFlag, plan, subscriptionProduct } from "@effect-x/purchase"

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

export class Pay extends BaseSDK<Pay, Record<string, never>, typeof plans, typeof products>({
  plans,
  products
}) {}
```

Wire one provider layer at runtime:

```ts
import { Paddle, Stripe } from "@effect-x/purchase"
import * as Layer from "effect/Layer"

export const StripePayLayer = Pay.layer(Pay).pipe(Layer.provide(Stripe.layer))
export const PaddlePayLayer = Pay.layer(Pay).pipe(Layer.provide(Paddle.layer))
```

Then call the shared workflow API:

```ts
const checkout = Pay.checkout.start({
  customerId,
  offerId: "app:pro_monthly"
})
```

## Current Status

The package already has the core runtime shape and a meaningful test suite, but it is still pre-1.0 and not yet at the level of a broadly adopted open-source billing SDK. The main gaps are around public API hardening, app-framework adapters, migration/setup ergonomics, docs depth, and release discipline.

See the monorepo docs roadmap for the concrete release-readiness plan.

## License

MIT
