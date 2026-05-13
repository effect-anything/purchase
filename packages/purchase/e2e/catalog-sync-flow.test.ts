import * as SqlClient from "@effect/sql/SqlClient"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as EffectString from "effect/String"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import { afterEach, describe, expect, it } from "vitest"

import type { Product, PurchasePlan } from "../src/dsl.ts"

import { creditPackProduct, oneTimeProduct, plan, subscriptionProduct } from "../src/dsl.ts"
import * as SQLite from "../src/internal/node-sqlite-client.ts"
import { BaseSDK } from "../src/sdk.ts"
import { PurchaseConfigLayer, syncCatalog } from "../src/sync/config-service.ts"
import { CommercialPay, CommercialPlans, CommercialProducts } from "../test/support/commercial-catalog.ts"
import { payTableDdl } from "../test/support/sqlite-pay-harness.ts"
import { makeTestPaymentLayer } from "../test/support/test-payment-provider.ts"

const tmpDirs: Array<string> = []

afterEach(() => {
  for (const tmpDir of tmpDirs.splice(0)) {
    fs.rmSync(tmpDir, { force: true, recursive: true })
  }
})

const createMigratedDatabase = () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pay-catalog-e2e-"))
  tmpDirs.push(tmpDir)

  const dbPath = path.join(tmpDir, "catalog.sqlite")
  const db = new DatabaseSync(dbPath)
  try {
    for (const statement of payTableDdl) {
      db.exec(statement)
    }
  } finally {
    db.close()
  }

  return dbPath
}

const summarizePlan = (syncPlan: {
  readonly productsToCreate: ReadonlyArray<unknown>
  readonly pricesToCreate: ReadonlyArray<unknown>
  readonly localRowsToInsert: ReadonlyArray<unknown>
  readonly localRowsToUpdate: ReadonlyArray<unknown>
  readonly providerRefsToInsert: ReadonlyArray<unknown>
  readonly providerRefsToUpdate: ReadonlyArray<unknown>
  readonly staleRows: ReadonlyArray<unknown>
  readonly archiveCandidates: ReadonlyArray<unknown>
}) => ({
  products: syncPlan.productsToCreate.length,
  prices: syncPlan.pricesToCreate.length,
  inserts: syncPlan.localRowsToInsert.length,
  updates: syncPlan.localRowsToUpdate.length,
  refsInsert: syncPlan.providerRefsToInsert.length,
  refsUpdate: syncPlan.providerRefsToUpdate.length,
  stale: syncPlan.staleRows.length,
  archive: syncPlan.archiveCandidates.length
})

const buildModifiedCatalog = () => {
  const sourcePlans: ReadonlyArray<PurchasePlan> = CommercialPlans
  const modifiedPlans: ReadonlyArray<PurchasePlan> = sourcePlans.flatMap((sourcePlan): Array<PurchasePlan> => {
    if (sourcePlan.id === "ai_credits_2000") {
      return []
    }

    if (sourcePlan.id !== "notes_pro_monthly") {
      return [sourcePlan]
    }

    return [
      plan({
        id: sourcePlan.id,
        ...(sourcePlan.group ? { group: sourcePlan.group } : {}),
        ...(sourcePlan.name ? { name: sourcePlan.name } : {}),
        price: { amount: 11, interval: "month" },
        includes: sourcePlan.includes,
        ...(sourcePlan.metadata ? { metadata: sourcePlan.metadata } : {}),
        ...(sourcePlan.provider ? { provider: sourcePlan.provider } : {})
      })
    ]
  })
  const modifiedPlanById = new Map(modifiedPlans.map((sourcePlan) => [sourcePlan.id, sourcePlan] as const))
  const sourceProducts: ReadonlyArray<Product> = CommercialProducts
  const modifiedProducts: ReadonlyArray<Product> = sourceProducts.map((sourceProduct): Product => {
    const productPlans = sourceProduct.plans.flatMap((sourcePlan) => {
      const nextPlan = modifiedPlanById.get(sourcePlan.id)
      return nextPlan ? [nextPlan] : []
    })
    const config = {
      ...(sourceProduct.name ? { name: sourceProduct.name } : {}),
      ...(sourceProduct.description ? { description: sourceProduct.description } : {}),
      ...(sourceProduct.metadata ? { metadata: sourceProduct.metadata } : {}),
      ...(sourceProduct.provider ? { provider: sourceProduct.provider } : {}),
      plans: productPlans
    }

    if (sourceProduct.mode === "subscription") {
      return subscriptionProduct(sourceProduct.id, config)
    }
    if (sourceProduct.mode === "credits") {
      return creditPackProduct(sourceProduct.id, config)
    }
    return oneTimeProduct(sourceProduct.id, config)
  })

  class ModifiedPay extends BaseSDK<
    ModifiedPay,
    Record<string, never>,
    ReadonlyArray<PurchasePlan>,
    ReadonlyArray<Product>
  >({
    plans: modifiedPlans,
    products: modifiedProducts
  }) {}

  return ModifiedPay
}

describe("catalog sync e2e flow", () => {
  it("applies migrations, syncs the example catalog, detects a catalog change, and converges", async () => {
    const dbPath = createMigratedDatabase()
    const payment = makeTestPaymentLayer({ provider: "stripe" })
    const dbLayer = SQLite.layer({
      filename: dbPath,
      disableWAL: true,
      transformQueryNames: EffectString.camelToSnake,
      transformResultNames: EffectString.snakeToCamel
    })

    const runOriginal = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      Effect.runPromise(
        effect.pipe(
          Effect.provide(
            Layer.provideMerge(
              Layer.mergeAll(
                CommercialPay.Layer,
                PurchaseConfigLayer({
                  plans: CommercialPlans as never,
                  products: CommercialProducts as never
                })
              ),
              Layer.mergeAll(payment.layer, dbLayer)
            )
          )
        ) as Effect.Effect<A, E>
      )

    const initial = await runOriginal(
      Effect.gen(function* () {
        yield* CommercialPay
        const first = yield* syncCatalog()
        const second = yield* syncCatalog({ dryRun: true })
        const sql = yield* SqlClient.SqlClient
        const rows = yield* sql.unsafe<{ readonly id: string; readonly price_amount: number | null }>(
          "SELECT id, price_amount FROM paykit_product ORDER BY id"
        ).withoutTransform
        const refs = yield* sql.unsafe<{ readonly owner_type: string }>(
          "SELECT owner_type FROM paykit_provider_ref ORDER BY id"
        ).withoutTransform

        return {
          first: summarizePlan(first.plan),
          second: summarizePlan(second.plan),
          rows,
          refs
        }
      })
    )

    expect(initial.first).toEqual({
      products: 3,
      prices: 1,
      inserts: 6,
      updates: 0,
      refsInsert: 9,
      refsUpdate: 0,
      stale: 0,
      archive: 0
    })
    expect(initial.second).toEqual({
      products: 0,
      prices: 0,
      inserts: 0,
      updates: 0,
      refsInsert: 0,
      refsUpdate: 0,
      stale: 0,
      archive: 0
    })
    expect(initial.rows.map((row) => row.id)).toEqual([
      "ai_credit_pack:ai_credits_2000",
      "ai_credit_pack:ai_credits_500",
      "desktop_pro:desktop_lifetime",
      "notes:notes_free",
      "notes:notes_pro_monthly",
      "notes:notes_pro_yearly"
    ])
    expect(initial.refs.filter((row) => row.owner_type === "product")).toHaveLength(3)
    expect(initial.refs.filter((row) => row.owner_type === "offer")).toHaveLength(6)
    expect(payment.calls.products.create).toHaveLength(3)
    expect(payment.calls.prices.create).toHaveLength(1)

    const ModifiedPay = buildModifiedCatalog()
    const runModified = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      Effect.runPromise(
        effect.pipe(
          Effect.provide(
            Layer.provideMerge(
              Layer.mergeAll(
                ModifiedPay.layer(ModifiedPay),
                PurchaseConfigLayer({
                  plans: ModifiedPay.plans as never,
                  products: ModifiedPay.products as never
                })
              ),
              Layer.mergeAll(payment.layer, dbLayer)
            )
          )
        ) as Effect.Effect<A, E>
      )

    const providerCallsBeforeModifiedApply = {
      productCreates: payment.calls.products.create.length,
      priceCreates: payment.calls.prices.create.length,
      priceArchives: payment.calls.prices.archive.length
    }

    const modified = await runModified(
      Effect.gen(function* () {
        yield* ModifiedPay
        const dryRun = yield* syncCatalog({ dryRun: true })
        const applied = yield* syncCatalog()
        const followUp = yield* syncCatalog({ dryRun: true })
        const sql = yield* SqlClient.SqlClient
        const rows = yield* sql.unsafe<{
          readonly id: string
          readonly price_amount: number | null
          readonly provider: string
        }>("SELECT id, price_amount, provider FROM paykit_product ORDER BY id").withoutTransform

        return {
          dryRun,
          dryRunSummary: summarizePlan(dryRun.plan),
          appliedSummary: summarizePlan(applied.plan),
          followUpSummary: summarizePlan(followUp.plan),
          rows
        }
      })
    )

    expect(modified.dryRunSummary).toEqual({
      products: 0,
      prices: 0,
      inserts: 0,
      updates: 2,
      refsInsert: 0,
      refsUpdate: 0,
      stale: 2,
      archive: 2
    })
    expect(modified.dryRun.plan.localRowsToUpdate).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ offerId: "notes:notes_pro_monthly", reason: "changed_price" }),
        expect.objectContaining({ offerId: "ai_credit_pack:ai_credits_2000", reason: "removed_offer" })
      ])
    )
    expect(modified.dryRun.plan.archiveCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "notes:notes_pro_monthly",
          action: "skip_external_or_unknown",
          safeToArchive: false
        }),
        expect.objectContaining({
          ownerId: "ai_credit_pack:ai_credits_2000",
          action: "skip_external_or_unknown",
          safeToArchive: false
        })
      ])
    )
    expect(modified.appliedSummary).toEqual(modified.dryRunSummary)
    expect(modified.followUpSummary).toEqual({
      products: 0,
      prices: 0,
      inserts: 0,
      updates: 0,
      refsInsert: 0,
      refsUpdate: 0,
      stale: 0,
      archive: 0
    })

    const monthly = modified.rows.find((row) => row.id === "notes:notes_pro_monthly")
    const removed = modified.rows.find((row) => row.id === "ai_credit_pack:ai_credits_2000")
    expect(monthly?.price_amount).toBe(11)
    expect(removed?.provider ? JSON.parse(removed.provider)["stripe:archivedAt"] : undefined).toBeDefined()
    expect(payment.calls.products.create.length - providerCallsBeforeModifiedApply.productCreates).toBe(0)
    expect(payment.calls.prices.create.length - providerCallsBeforeModifiedApply.priceCreates).toBe(0)
    expect(payment.calls.prices.archive.length - providerCallsBeforeModifiedApply.priceArchives).toBe(0)
  })
})
