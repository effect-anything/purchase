import { describe, expect, it } from "@effect/vitest"
import * as Option from "effect/Option"

import { formatHumanResult, parseCatalogSyncOptions, parseDatabaseTarget } from "../src/cli/catalog-sync.ts"
import { formatPrepareResult, parsePrepareOptions } from "../src/cli/prepare.ts"

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
        features: 0,
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

  it("parses prepare options and defaults to dry-run", () => {
    const options = parsePrepareOptions({
      module: "catalog.ts",
      exportName: Option.none(),
      provider: "paddle",
      environment: "sandbox",
      checkoutUrl: Option.some("https://checkout.example.test"),
      webhookUrl: Option.some("https://app.example.test/api/webhooks/paddle"),
      apply: false,
      dryRun: false,
      json: false,
      showSecrets: false,
      stripeApiKey: Option.none(),
      stripeWebhookSecret: Option.none(),
      paddleApiToken: Option.none(),
      paddleWebhookToken: Option.none()
    })

    expect(options.dryRun).toBe(true)
    expect(options.checkoutUrl).toBe("https://checkout.example.test")
    expect(options.webhookUrl).toBe("https://app.example.test/api/webhooks/paddle")
  })

  it("formats paddle prepare plans with diffs", () => {
    const output = formatPrepareResult(
      {
        modulePath: "catalog.ts",
        provider: "paddle",
        environment: "sandbox",
        checkoutUrl: "https://checkout.example.test",
        webhookUrl: "https://app.example.test/api/webhooks/paddle",
        apply: false,
        dryRun: true,
        json: false,
        showSecrets: false
      },
      {
        provider: "paddle",
        dryRun: true,
        secrets: {
          webhook: {
            current: "pdl_ntfset_01gkpjp8bkm3tm53kdgkx6sms7_secretvalue"
          }
        },
        plan: {
          status: "ready",
          changes: [
            {
              path: "checkout.defaultCheckoutUrl",
              current: undefined,
              desired: "https://checkout.example.test",
              action: "create"
            },
            {
              path: "webhook.destinationUrl",
              current: "https://app.example.test/api/webhooks/paddle-old",
              desired: "https://app.example.test/api/webhooks/paddle",
              action: "update"
            },
            {
              path: "webhook.subscribedEvents",
              current: ["transaction.updated"],
              desired: ["transaction.updated", "subscription.updated"],
              action: "update"
            },
            {
              path: "checkout.paymentMethods.applePay",
              current: false,
              desired: true,
              action: "update"
            }
          ],
          checkoutUrl: {
            current: undefined,
            desired: "https://checkout.example.test",
            action: "create"
          },
          webhookUrl: {
            current: "https://app.example.test/api/webhooks/paddle-old",
            desired: "https://app.example.test/api/webhooks/paddle",
            action: "update"
          }
        }
      }
    )

    expect(output).toContain("Provider · paddle (sandbox)")
    expect(output).toContain("Checkout URL · + create https://checkout.example.test")
    expect(output).toContain("Webhook URL  · ~ update https://app.example.test/api/webhooks/paddle")
    expect(output).toContain("Webhook Secret · pdl_ntfs...tvalue")
    expect(output).toContain(
      '~ update webhook.subscribedEvents (["transaction.updated"] -> ["transaction.updated","subscription.updated"])'
    )
    expect(output).toContain("~ update checkout.paymentMethods.applePay (false -> true)")
  })

  it("prints full secrets when showSecrets is enabled", () => {
    const output = formatPrepareResult(
      {
        modulePath: "catalog.ts",
        provider: "paddle",
        environment: "sandbox",
        apply: false,
        dryRun: true,
        json: false,
        showSecrets: true
      },
      {
        provider: "paddle",
        dryRun: true,
        secrets: {
          webhook: {
            current: "pdl_ntfset_01gkpjp8bkm3tm53kdgkx6sms7_secretvalue"
          }
        },
        plan: {
          status: "ready",
          changes: []
        }
      }
    )

    expect(output).toContain("Webhook Secret · pdl_ntfset_01gkpjp8bkm3tm53kdgkx6sms7_secretvalue")
  })
})
