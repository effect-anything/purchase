Verified public SDK checkout path coverage in e2e/checkout-workflow.test.ts.
Captured redirect URL, intent metadata, and provider/customer refs in assertions.
Checkout test now asserts the customer-facing SDK path end-to-end: returned session URL, persisted intent row, and provider call payload.
The harness does not persist provider customer/session IDs on the checkout intent row, so assertions were limited to fields actually stored by the contract.
Final checkout coverage now asserts the public SDK output, provider call payload, persisted intent row, and stored metadata shape.
The suite also proved the checkout intent row does not store provider_customer_id, so persisted assertions stay aligned to the actual contract.

- Task 1 audit: existing examples use narrow imports for dsl, schema, provider, paddle, sdk, and stripe; tests/e2e also exercise source-internal paths directly but those are not consumer package subpaths.
- Stable consumer contract now favors the root @effect-x/purchase import while retaining documented narrow subpaths for db, dsl, errors, paddle, provider, schema, sdk, stripe, and tables.
- Task 3: catalog.sync dryRun builds product/price/local/provider-ref/archive plans without provider calls, local row writes, provider-ref writes, or archive calls; normal sync persists local offer rows and provider refs for reuse.
- Task 3: catalog sync ownership is metadata-driven: DSL provider ids are external, SDK-created ids are sdk-owned, and only sdk-owned archive candidates may call provider archive APIs; stale local rows get provider archive timestamps after non-dry-run processing.

- Task 7: storage adapter audit confirmed @effect-x/purchase/db and /tables still expose typed models/TABLES while sqlite harness and D1 HTTP tests exercise snake_case SQL compatibility without adding a backend.

- Task 4: Next.js example now uses the root @effect-x/purchase import for catalog DSL, BaseSDK, provider classes, and PaymentProviderTag; schema-only types remain on the documented schema subpath.
- Task 4: Provider wiring is clearer for adopters: examples/nextjs/purchase.ts binds the catalog once, while context.ts composes Pay.Paddle with Paddle.layerConfig in sandbox mode at the runtime boundary.
- Task 4: README quick start now mirrors the Next.js example path and explicitly frames Paddle sandbox / Stripe sandbox test-mode wiring.

- Task 6: webhook workflow tests now assert processed receipts, persisted commercial events, projection rows, entitlement rows, duplicate no-mutation semantics, and replayed normalized event/reconciliation trigger shape.
- Task 6: provider replay fixtures now verify repeated unmarshal/normalize of the same signed payload is stable for supported Stripe and Paddle events.
