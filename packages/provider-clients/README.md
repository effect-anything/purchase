# @effect-x/purchase-provider-clients

Effect v3 OpenAPI-generated clients for third-party payment providers.

This package is intentionally standalone for now. It does not depend on `@effect-x/purchase`; higher-level payment workflows can depend on it later once the generated client surface is stable.

## Providers

- Stripe: generated from `stripe/openapi` SDK spec.
- Paddle: generated from `PaddleHQ/paddle-openapi` Billing API spec.
- Polar: generated from Polar's public OpenAPI schema at `https://api.polar.sh/openapi.json`.
- Creem: generated from `armitage-labs/creem`'s SDK OpenAPI schema.
- Dodo Payments: generated from a local minimal OpenAPI spec based on the official Stainless-generated TypeScript SDK and public API docs. Replace `specs/dodo/openapi.json` with the official raw spec when Dodo publishes one.
- Lemon Squeezy: generated from a local minimal OpenAPI spec based on the official docs and `lmsqueezy/lemonsqueezy.js`, because no public raw OpenAPI document was found. Replace `specs/lemon/openapi.json` with an official spec if one becomes available.

## Generate

```bash
pnpm --filter @effect-x/purchase-provider-clients generate:stripe
pnpm --filter @effect-x/purchase-provider-clients generate:paddle
pnpm --filter @effect-x/purchase-provider-clients generate:polar
pnpm --filter @effect-x/purchase-provider-clients generate:creem
pnpm --filter @effect-x/purchase-provider-clients generate:dodo
pnpm --filter @effect-x/purchase-provider-clients generate:lemon
pnpm --filter @effect-x/purchase-provider-clients generate
```

The generator creates provider-level shared models:

- `src/stripe/models.ts`
- `src/paddle/models.ts`
- `src/polar/models.ts`
- `src/creem/models.ts`
- `src/dodo/models.ts`
- `src/lemon/models.ts`

Operations import those shared models instead of repeatedly expanding the same OpenAPI component schemas. Recursive or mutually recursive schemas use `Schema.suspend` and only circular models receive a wide `Schema.Schema.AnyNoContext` annotation to avoid TypeScript recursive initializer errors.

## Verify

```bash
pnpm --filter @effect-x/purchase-provider-clients check
pnpm --filter @effect-x/purchase-provider-clients exec tsgo -p tsconfig.scripts.json
pnpm --filter @effect-x/purchase-provider-clients build
```

## Import surface

```ts
import * as Stripe from "@effect-x/purchase-provider-clients/stripe"
import * as StripeOperations from "@effect-x/purchase-provider-clients/stripe/operations"
import * as StripeModels from "@effect-x/purchase-provider-clients/stripe/models"

import * as Paddle from "@effect-x/purchase-provider-clients/paddle"
import * as PaddleOperations from "@effect-x/purchase-provider-clients/paddle/operations"
import * as PaddleModels from "@effect-x/purchase-provider-clients/paddle/models"

import * as Polar from "@effect-x/purchase-provider-clients/polar"
import * as PolarOperations from "@effect-x/purchase-provider-clients/polar/operations"
import * as PolarModels from "@effect-x/purchase-provider-clients/polar/models"

import * as Creem from "@effect-x/purchase-provider-clients/creem"
import * as CreemOperations from "@effect-x/purchase-provider-clients/creem/operations"
import * as CreemModels from "@effect-x/purchase-provider-clients/creem/models"

import * as Dodo from "@effect-x/purchase-provider-clients/dodo"
import * as DodoOperations from "@effect-x/purchase-provider-clients/dodo/operations"
import * as DodoModels from "@effect-x/purchase-provider-clients/dodo/models"
import * as Lemon from "@effect-x/purchase-provider-clients/lemon"
import * as LemonOperations from "@effect-x/purchase-provider-clients/lemon/operations"
import * as LemonModels from "@effect-x/purchase-provider-clients/lemon/models"
```
