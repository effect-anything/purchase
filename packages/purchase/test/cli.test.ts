import { describe, expect, it } from "@effect/vitest"
import * as Option from "effect/Option"

import { formatHumanResult, parseCatalogSyncOptions, parseDatabaseTarget } from "../src/bin.ts"

describe("purchase cli options", () => {
  it("parses sqlite database urls", () => {
    const target = parseDatabaseTarget({
      database: "sqlite",
      databaseUrl: Option.some("sqlite:./local.db"),
      cloudflareAccountId: Option.none(),
      cloudflareApiToken: Option.none(),
      cloudflareD1DatabaseId: Option.none(),
      cloudflareApiBaseUrl: Option.none()
    })

    expect(target).toEqual({
      _tag: "sqlite",
      filename: "./local.db",
      label: "sqlite:./local.db"
    })
  })

  it("parses postgres database urls", () => {
    const target = parseDatabaseTarget({
      database: "postgres",
      databaseUrl: Option.some("postgresql://localhost/purchase"),
      cloudflareAccountId: Option.none(),
      cloudflareApiToken: Option.none(),
      cloudflareD1DatabaseId: Option.none(),
      cloudflareApiBaseUrl: Option.none()
    })

    expect(target).toEqual({
      _tag: "postgres",
      url: "postgresql://localhost/purchase"
    })
  })

  it("parses cloudflare d1 http api options", () => {
    const target = parseDatabaseTarget({
      database: "cloudflare-d1",
      databaseUrl: Option.none(),
      cloudflareAccountId: Option.some("account_123"),
      cloudflareApiToken: Option.some("cf_token"),
      cloudflareD1DatabaseId: Option.some("database_123"),
      cloudflareApiBaseUrl: Option.some("https://api.example.test")
    })

    expect(target).toEqual({
      _tag: "cloudflare-d1",
      accountId: "account_123",
      apiToken: "cf_token",
      databaseId: "database_123",
      baseUrl: "https://api.example.test"
    })
  })

  it("defaults to dry-run and reads provider credentials from environment", () => {
    const previousStripeKey = process.env.STRIPE_API_KEY
    process.env.STRIPE_API_KEY = "sk_test_cli"
    try {
      const options = parseCatalogSyncOptions({
        module: "catalog.ts",
        exportName: Option.none(),
        provider: "stripe",
        environment: "sandbox",
        database: "sqlite",
        databaseUrl: Option.some("sqlite::memory:"),
        cloudflareAccountId: Option.none(),
        cloudflareApiToken: Option.none(),
        cloudflareD1DatabaseId: Option.none(),
        cloudflareApiBaseUrl: Option.none(),
        apply: false,
        dryRun: false,
        json: false,
        stripeApiKey: Option.none(),
        stripeWebhookSecret: Option.none(),
        paddleApiToken: Option.none(),
        paddleWebhookToken: Option.none()
      })

      expect(options.dryRun).toBe(true)
      expect(options.stripeApiKey).toBe("sk_test_cli")
    } finally {
      if (previousStripeKey === undefined) {
        delete process.env.STRIPE_API_KEY
      } else {
        process.env.STRIPE_API_KEY = previousStripeKey
      }
    }
  })

  it("formats cloudflare d1 result labels", () => {
    const output = formatHumanResult(
      {
        command: "catalog.sync",
        modulePath: "catalog.ts",
        provider: "stripe",
        environment: "sandbox",
        database: {
          _tag: "cloudflare-d1",
          accountId: "account_123",
          apiToken: "cf_token",
          databaseId: "database_123"
        },
        apply: false,
        dryRun: true,
        json: false
      },
      {
        provider: "stripe",
        offers: 0,
        dryRun: true,
        plan: {
          productsToCreate: [],
          pricesToCreate: [],
          localRowsToInsert: [],
          localRowsToUpdate: [],
          providerRefsToInsert: [],
          providerRefsToUpdate: [],
          staleRows: [],
          archiveCandidates: []
        }
      }
    )

    expect(output).toContain("cloudflare-d1:database_123")
    expect(output).toContain("No changes")
  })
})
