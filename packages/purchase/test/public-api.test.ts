import { describe, expect, it } from "@effect/vitest"
import { readFileSync } from "node:fs"

import * as Db from "../src/db.ts"
import * as Dsl from "../src/dsl.ts"
import * as Errors from "../src/errors.ts"
import * as PaddleSubpath from "../src/paddle.ts"
import * as ProviderSubpath from "../src/provider.ts"
import * as Purchase from "../src/public.ts"
import * as Schema from "../src/schema.ts"
import * as Sdk from "../src/sdk.ts"
import * as StripeSubpath from "../src/stripe.ts"
import * as Tables from "../src/tables.ts"

type PackageJsonExports = {
  readonly exports: Record<string, string | null>
  readonly publishConfig: {
    readonly exports: Record<string, string | null>
  }
}

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as PackageJsonExports

const supportedPackageExports = [
  ".",
  "./db",
  "./dsl",
  "./errors",
  "./paddle",
  "./provider",
  "./schema",
  "./sdk",
  "./stripe",
  "./tables",
  "./package.json"
] as const

const blockedPackageExports = ["./internal/*", "./*/index"] as const

describe("public package api", () => {
  it("exposes the stable root entrypoint surface", () => {
    expect(Purchase.PurchaseSDK).toBeTypeOf("function")
    expect(Purchase.BaseSDK).toBe(Purchase.PurchaseSDK)
    expect(Purchase.plan).toBeTypeOf("function")
    expect(Purchase.subscriptionProduct).toBeTypeOf("function")
    expect(Purchase.PurchaseProvider.fromTags).toBeTypeOf("function")
    expect(Purchase.PurchaseProvider.FromTags).toBeTypeOf("function")
    expect(Purchase.PayProvider).toBe(Purchase.PurchaseProvider)
    expect(Purchase.PaymentProviderTag).toBeDefined()
    expect(Purchase.Paddle).toBeDefined()
    expect(Purchase.Stripe).toBeDefined()
    expect(Purchase.CustomerId).toBeDefined()
    expect(Purchase.SubscriptionNotFound).toBeDefined()
    expect(Purchase.PayStorageAdapter).toBeDefined()
  })

  it("keeps documented narrow subpath imports available", () => {
    expect(Db.PayStorageAdapter).toBe(Purchase.PayStorageAdapter)
    expect(Dsl.plan).toBe(Purchase.plan)
    expect(Errors.SubscriptionNotFound).toBe(Purchase.SubscriptionNotFound)
    expect(PaddleSubpath.Paddle).toBe(Purchase.Paddle)
    expect(ProviderSubpath.PaymentProviderTag).toBe(Purchase.PaymentProviderTag)
    expect(Schema.CustomerId).toBe(Purchase.CustomerId)
    expect(Sdk.PurchaseSDK).toBe(Purchase.PurchaseSDK)
    expect(Sdk.BaseSDK).toBe(Purchase.BaseSDK)
    expect(StripeSubpath.Stripe).toBe(Purchase.Stripe)
    expect(Tables.TABLES).toBeDefined()
  })

  it("declares only the supported consumer import paths", () => {
    expect(Object.keys(packageJson.exports).sort()).toEqual(
      [...supportedPackageExports, ...blockedPackageExports].sort()
    )
    expect(Object.keys(packageJson.publishConfig.exports).sort()).toEqual(
      [...supportedPackageExports, ...blockedPackageExports].sort()
    )
    expect(packageJson.exports["./internal/*"]).toBeNull()
    expect(packageJson.exports["./*/index"]).toBeNull()
    expect(packageJson.exports).not.toHaveProperty("./*")
    expect(packageJson.publishConfig.exports).not.toHaveProperty("./*")
  })
})
