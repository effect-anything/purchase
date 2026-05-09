import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"

import { runPayEffect } from "./support/run-pay-effect.ts"
import { countRows, parseJsonColumn, queryAll } from "./support/sqlite-pay-harness.ts"
import { TestPay, testOfferIds } from "./support/test-catalog.ts"
import { makeTestPaymentLayer } from "./support/test-payment-provider.ts"

describe("core catalog sync workflow", () => {
  it.effect("catalog.sync dry run does not call provider or write local rows", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        const result = yield* sdk.catalog.sync({ dryRun: true })

        expect(result.provider).toBe("stripe")
        expect(result.dryRun).toBe(true)
        expect(result.offers).toBeGreaterThan(0)
        expect(result.features).toBeGreaterThan(0)
        expect(result.plan.productsToCreate.map((entry) => entry.productId).sort()).toEqual([
          "ai_credit_pack",
          "lifetime_product",
          "saas"
        ])
        expect(result.plan.pricesToCreate.map((entry) => entry.offerId).sort()).toEqual([
          testOfferIds.credits100,
          testOfferIds.lifetime,
          testOfferIds.free,
          testOfferIds.proMonthly
        ])
        expect(result.plan.localRowsToInsert.map((entry) => entry.offerId).sort()).toEqual([
          testOfferIds.credits100,
          testOfferIds.lifetime,
          testOfferIds.free,
          testOfferIds.proMonthly
        ])
        expect(result.plan.providerRefsToInsert).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ ownerType: "product", ownerId: "saas", kind: "product" }),
            expect.objectContaining({ ownerType: "offer", ownerId: testOfferIds.proMonthly, kind: "offer" })
          ])
        )
        expect(result.plan.providerRefsToUpdate).toEqual([])
        expect(result.plan.archiveCandidates).toEqual([])
        expect(payment.calls.products.create).toHaveLength(0)
        expect(payment.calls.prices.create).toHaveLength(0)
        expect(payment.calls.products.archive).toHaveLength(0)
        expect(payment.calls.prices.archive).toHaveLength(0)
        expect(yield* countRows("paykit_product")).toBe(0)
        expect(yield* countRows("paykit_provider_ref")).toBe(0)
      }),
      payment.layer
    )
  })

  it.effect("catalog.sync writes products and provider refs when not dry run", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        const result = yield* sdk.catalog.sync()

        expect(result.provider).toBe("stripe")
        expect(result.dryRun).toBe(false)

        const products = yield* queryAll<{ readonly id: string }>("SELECT id FROM paykit_product ORDER BY id")
        expect(products.map((row) => row.id)).toEqual([
          testOfferIds.credits100,
          testOfferIds.lifetime,
          testOfferIds.free,
          testOfferIds.proMonthly
        ])
        expect(result.plan.localRowsToInsert.map((entry) => entry.offerId).sort()).toEqual(
          products.map((row) => row.id)
        )
        expect(result.plan.providerRefsToInsert).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ ownerType: "product", ownerId: "saas", kind: "product" }),
            expect.objectContaining({ ownerType: "offer", ownerId: testOfferIds.proMonthly, kind: "offer" })
          ])
        )

        const productRefs = yield* queryAll<{
          readonly provider: string
          readonly owner_type: string
          readonly kind: string
        }>(
          `SELECT provider, owner_type, kind
           FROM paykit_provider_ref
           WHERE provider = 'stripe' AND owner_type = 'product' AND kind = 'product'`
        )
        const offerRefs = yield* queryAll<{
          readonly provider: string
          readonly owner_type: string
          readonly kind: string
        }>(
          `SELECT provider, owner_type, kind
           FROM paykit_provider_ref
           WHERE provider = 'stripe' AND owner_type = 'offer' AND kind = 'offer'`
        )

        expect(productRefs.length).toBeGreaterThan(0)
        expect(offerRefs.length).toBeGreaterThan(0)
        expect(productRefs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ provider: "stripe", owner_type: "product", kind: "product" })
          ])
        )
        expect(offerRefs).toEqual(
          expect.arrayContaining([expect.objectContaining({ provider: "stripe", owner_type: "offer", kind: "offer" })])
        )
        expect(payment.calls.products.create.length).toBeGreaterThan(0)
        expect(payment.calls.prices.create.length).toBeGreaterThan(0)

        const proPriceCreate = payment.calls.prices.create.find(
          (call) => call.metadata?.commercialOfferId === testOfferIds.proMonthly
        )
        expect(proPriceCreate?.unitPrice.amount).toBe("2000")
        expect(proPriceCreate?.unitPrice.currencyCode).toBe("USD")
      }),
      payment.layer
    )
  })

  it.effect("catalog.sync reuses persisted provider refs on second sync", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay

        yield* sdk.catalog.sync()
        const firstProductRows = yield* countRows("paykit_product")
        const firstProviderRefRows = yield* countRows("paykit_provider_ref")
        const firstProductCreates = payment.calls.products.create.length
        const firstPriceCreates = payment.calls.prices.create.length

        yield* sdk.catalog.sync()

        expect(yield* countRows("paykit_product")).toBe(firstProductRows)
        expect(yield* countRows("paykit_provider_ref")).toBe(firstProviderRefRows)
        expect(payment.calls.products.create).toHaveLength(firstProductCreates)
        expect(payment.calls.prices.create).toHaveLength(firstPriceCreates)

        const products = yield* queryAll<{ readonly id: string; readonly provider: string }>(
          "SELECT id, provider FROM paykit_product ORDER BY id"
        )
        expect(products.length).toBeGreaterThan(0)
        for (const product of products) {
          const provider = parseJsonColumn(product.provider)
          expect(provider).toHaveProperty("stripe:product")
          expect(provider).toHaveProperty("stripe")
        }

        const refs = yield* queryAll<{ readonly owner_type: string; readonly kind: string }>(
          `SELECT owner_type, kind
           FROM paykit_provider_ref
           WHERE provider = 'stripe'
           ORDER BY owner_type, kind`
        )
        expect(refs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ owner_type: "product", kind: "product" }),
            expect.objectContaining({ owner_type: "offer", kind: "offer" })
          ])
        )
      }),
      payment.layer
    )
  })

  it.effect("catalog.sync creates a replacement provider price when a sdk-owned price changes", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        const now = "2025-01-01T00:00:00.000Z"
        const provider = JSON.stringify({
          "stripe:product": "prod_existing_saas",
          stripe: "price_old_pro_monthly",
          "stripe:ownership:product": "sdk",
          "stripe:ownership:offer": "sdk"
        })

        yield* queryAll(
          `INSERT INTO paykit_product
             (internal_id, id, version, name, "group", is_default, price_amount, price_interval, hash, provider, created_at, updated_at)
           VALUES (?, ?, 1, 'Pro Monthly', 'main', 0, 15, 'month', 'old_hash', ?, ?, ?)`,
          ["internal_old_pro_monthly", testOfferIds.proMonthly, provider, now, now]
        )
        yield* queryAll(
          `INSERT INTO paykit_provider_ref
             (id, provider, owner_type, owner_id, provider_id, kind, created_at, updated_at)
           VALUES
             ('stripe:product:product:saas', 'stripe', 'product', 'saas', 'prod_existing_saas', 'product', ?, ?),
             ('stripe:offer:offer:saas:pro_monthly', 'stripe', 'offer', ?, 'price_old_pro_monthly', 'offer', ?, ?)`,
          [now, now, testOfferIds.proMonthly, now, now]
        )

        const result = yield* sdk.catalog.sync()

        expect(result.plan.pricesToCreate).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              offerId: testOfferIds.proMonthly,
              providerProductId: "prod_existing_saas",
              reason: "changed_price"
            })
          ])
        )
        expect(result.plan.archiveCandidates).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ownerType: "offer",
              ownerId: testOfferIds.proMonthly,
              providerId: "price_old_pro_monthly",
              safeToArchive: true,
              ownership: "sdk",
              action: "provider_archive_if_supported"
            })
          ])
        )
        expect(payment.calls.products.create).toHaveLength(2)
        expect(payment.calls.prices.archive).toEqual([{ priceId: "price_old_pro_monthly" }])

        const updated = yield* queryAll<{ readonly provider: string; readonly price_amount: number }>(
          "SELECT provider, price_amount FROM paykit_product WHERE id = ?",
          [testOfferIds.proMonthly]
        )
        const updatedProvider = parseJsonColumn(updated[0]?.provider)
        expect(updated[0]?.price_amount).toBe(20)
        expect(updatedProvider.stripe).not.toBe("price_old_pro_monthly")
        expect(updatedProvider["stripe:ownership:offer"]).toBe("sdk")
        expect(updatedProvider["stripe:archivedAt"]).toBeUndefined()
      }),
      payment.layer
    )
  })

  it.effect("catalog.sync marks removed offers stale and never archives externally owned provider ids", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        const now = "2025-01-01T00:00:00.000Z"
        const removedOfferId = "saas:removed"
        const provider = JSON.stringify({
          "stripe:product": "prod_external_saas",
          stripe: "price_external_removed",
          "stripe:ownership:product": "external",
          "stripe:ownership:offer": "external"
        })

        yield* queryAll(
          `INSERT INTO paykit_product
             (internal_id, id, version, name, "group", is_default, price_amount, price_interval, hash, provider, created_at, updated_at)
           VALUES (?, ?, 1, 'Removed', 'main', 0, 10, 'month', 'old_hash', ?, ?, ?)`,
          ["internal_removed", removedOfferId, provider, now, now]
        )

        const result = yield* sdk.catalog.sync()

        expect(result.plan.staleRows).toEqual(
          expect.arrayContaining([expect.objectContaining({ offerId: removedOfferId, reason: "removed_offer" })])
        )
        expect(result.plan.archiveCandidates).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ownerType: "offer",
              ownerId: removedOfferId,
              providerId: "price_external_removed",
              safeToArchive: false,
              ownership: "external",
              action: "skip_external_or_unknown"
            })
          ])
        )
        expect(result.plan.localRowsToUpdate).toEqual(
          expect.arrayContaining([expect.objectContaining({ offerId: removedOfferId, reason: "removed_offer" })])
        )
        expect(payment.calls.products.archive).toHaveLength(0)
        expect(payment.calls.prices.archive).toHaveLength(0)

        const archived = yield* queryAll<{ readonly provider: string }>(
          "SELECT provider FROM paykit_product WHERE id = ?",
          [removedOfferId]
        )
        const archivedProvider = parseJsonColumn(archived[0]?.provider)
        expect(archivedProvider["stripe:archivedAt"]).toBeDefined()

        const followUp = yield* sdk.catalog.sync({ dryRun: true })
        expect(followUp.plan.staleRows).not.toEqual(
          expect.arrayContaining([expect.objectContaining({ offerId: removedOfferId })])
        )
        expect(followUp.plan.localRowsToUpdate).not.toEqual(
          expect.arrayContaining([expect.objectContaining({ offerId: removedOfferId })])
        )
        expect(payment.calls.products.archive).toHaveLength(0)
        expect(payment.calls.prices.archive).toHaveLength(0)
      }),
      payment.layer
    )
  })

  it.effect("catalog.sync dry run plans sdk-owned removals without archive calls or local archive markers", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        const now = "2025-01-01T00:00:00.000Z"
        const removedOfferId = "saas:removed_sdk"
        const provider = JSON.stringify({
          "stripe:product": "prod_sdk_removed",
          stripe: "price_sdk_removed",
          "stripe:ownership:product": "sdk",
          "stripe:ownership:offer": "sdk"
        })

        yield* queryAll(
          `INSERT INTO paykit_product
             (internal_id, id, version, name, "group", is_default, price_amount, price_interval, hash, provider, created_at, updated_at)
           VALUES (?, ?, 1, 'Removed SDK', 'main', 0, 10, 'month', 'old_hash', ?, ?, ?)`,
          ["internal_removed_sdk", removedOfferId, provider, now, now]
        )

        const result = yield* sdk.catalog.sync({ dryRun: true })

        expect(result.plan.staleRows).toEqual(
          expect.arrayContaining([expect.objectContaining({ offerId: removedOfferId, reason: "removed_offer" })])
        )
        expect(result.plan.archiveCandidates).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ownerType: "offer",
              ownerId: removedOfferId,
              providerId: "price_sdk_removed",
              safeToArchive: true,
              ownership: "sdk",
              action: "provider_archive_if_supported"
            })
          ])
        )
        expect(payment.calls.prices.archive).toHaveLength(0)

        const rows = yield* queryAll<{ readonly provider: string; readonly hash: string }>(
          "SELECT provider, hash FROM paykit_product WHERE id = ?",
          [removedOfferId]
        )
        const persistedProvider = parseJsonColumn(rows[0]?.provider)
        expect(rows[0]?.hash).toBe("old_hash")
        expect(persistedProvider["stripe:archivedAt"]).toBeUndefined()
      }),
      payment.layer
    )
  })

  it.effect("catalog.sync archives sdk-owned stale provider products only when product leaves catalog", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        const now = "2025-01-01T00:00:00.000Z"
        const removedOfferId = "removed_product:legacy"
        const provider = JSON.stringify({
          "stripe:product": "prod_sdk_removed_product",
          stripe: "price_sdk_removed_product",
          "stripe:ownership:product": "sdk",
          "stripe:ownership:offer": "sdk"
        })

        yield* queryAll(
          `INSERT INTO paykit_product
             (internal_id, id, version, name, "group", is_default, price_amount, price_interval, hash, provider, created_at, updated_at)
           VALUES (?, ?, 1, 'Removed Product', 'main', 0, 10, 'month', 'old_hash', ?, ?, ?)`,
          ["internal_removed_product", removedOfferId, provider, now, now]
        )

        const result = yield* sdk.catalog.sync()

        expect(result.plan.archiveCandidates).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ownerType: "offer",
              ownerId: removedOfferId,
              providerId: "price_sdk_removed_product",
              safeToArchive: true,
              ownership: "sdk"
            }),
            expect.objectContaining({
              ownerType: "product",
              ownerId: "removed_product",
              providerId: "prod_sdk_removed_product",
              safeToArchive: true,
              ownership: "sdk",
              action: "provider_archive_if_supported"
            })
          ])
        )
        expect(payment.calls.prices.archive).toEqual([{ priceId: "price_sdk_removed_product" }])
        expect(payment.calls.products.archive).toEqual([{ productId: "prod_sdk_removed_product" }])

        const archived = yield* queryAll<{ readonly provider: string }>(
          "SELECT provider FROM paykit_product WHERE id = ?",
          [removedOfferId]
        )
        const archivedProvider = parseJsonColumn(archived[0]?.provider)
        expect(archivedProvider["stripe:archivedAt"]).toBeDefined()
      }),
      payment.layer
    )
  })

  it.effect("catalog.sync provider failure is reported with catalog workflow context", () => {
    const payment = makeTestPaymentLayer({
      unsupported: { "prices.create": true }
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay

        const result = yield* Effect.either(sdk.catalog.sync())

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
          expect((result.left as { readonly workflow?: string }).workflow).toBe("catalog.sync")
        }
        expect(yield* countRows("paykit_product")).toBe(0)
        expect(yield* countRows("paykit_provider_ref")).toBe(0)
      }),
      payment.layer
    )
  })
})
