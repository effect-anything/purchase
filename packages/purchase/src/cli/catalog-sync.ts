import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import type { PaymentEnvironmentTag, PaymentProviderTag } from "../provider/types.ts"

import { sync } from "../catalog/sync.ts"
import { CatalogState } from "../core/catalog-state.ts"
import { PurchaseStorageAdapter } from "../db.ts"
import { makeProviderLayer } from "../provider/utils.ts"
import { loadPurchaseConfigModule } from "./config-loader.ts"
import {
  checkCatalogSchema,
  makeDatabaseLayer,
  parseDatabaseTarget,
  type DatabaseKind,
  type DatabaseTarget
} from "./db.ts"
import { formatCatalogSyncResult } from "./utils.ts"

type CliCommand = "catalog.sync"

interface CliOptions {
  readonly command: CliCommand
  readonly modulePath: string
  readonly exportName?: string | undefined
  readonly provider: PaymentProviderTag
  readonly environment: PaymentEnvironmentTag
  readonly database: DatabaseTarget
  readonly apply: boolean
  readonly dryRun: boolean
  readonly json: boolean
  readonly stripeApiKey?: string | undefined
  readonly stripeWebhookSecret?: string | undefined
  readonly paddleApiToken?: string | undefined
  readonly paddleWebhookToken?: string | undefined
}

const envFallback = (value: Option.Option<string>, envName: string) =>
  Option.getOrElse(value, () => process.env[envName])

export const parseCatalogSyncOptions = (config: {
  readonly module: string
  readonly exportName: Option.Option<string>
  readonly provider: PaymentProviderTag
  readonly environment: PaymentEnvironmentTag
  readonly database: DatabaseKind
  readonly databaseUrl: Option.Option<string>
  readonly cloudflareAccountId: Option.Option<string>
  readonly cloudflareApiToken: Option.Option<string>
  readonly cloudflareD1DatabaseId: Option.Option<string>
  readonly cloudflareApiBaseUrl: Option.Option<string>
  readonly apply: boolean
  readonly dryRun: boolean
  readonly json: boolean
  readonly stripeApiKey: Option.Option<string>
  readonly stripeWebhookSecret: Option.Option<string>
  readonly paddleApiToken: Option.Option<string>
  readonly paddleWebhookToken: Option.Option<string>
}): CliOptions => {
  if (config.apply && config.dryRun) {
    throw new Error("Use either --dry-run or --apply, not both.")
  }

  const options: CliOptions = {
    command: "catalog.sync",
    modulePath: config.module,
    exportName: Option.getOrUndefined(config.exportName),
    provider: config.provider,
    environment: config.environment,
    database: parseDatabaseTarget(config),
    apply: config.apply,
    dryRun: !config.apply,
    json: config.json,
    stripeApiKey: envFallback(config.stripeApiKey, "STRIPE_API_KEY"),
    stripeWebhookSecret: envFallback(config.stripeWebhookSecret, "STRIPE_WEBHOOK_SECRET"),
    paddleApiToken: envFallback(config.paddleApiToken, "PADDLE_API_TOKEN"),
    paddleWebhookToken: envFallback(config.paddleWebhookToken, "PADDLE_WEBHOOK_TOKEN")
  }

  if (!options.dryRun && options.provider === "stripe" && !options.stripeApiKey) {
    throw new Error("Missing STRIPE_API_KEY or --stripe-api-key for --apply.")
  }
  if (!options.dryRun && options.provider === "paddle" && !options.paddleApiToken) {
    throw new Error("Missing PADDLE_API_TOKEN or --paddle-api-token for --apply.")
  }

  return options
}

const textOption = (name: string, description: string) => Options.text(name).pipe(Options.withDescription(description))

const catalogSyncOptions = {
  module: textOption("module", "Module exporting plans/products or a PurchaseSDK subclass."),
  exportName: Options.text("export").pipe(Options.optional, Options.withDescription("Named export to load.")),
  provider: Options.choice("provider", ["stripe", "paddle"] as const).pipe(
    Options.withDefault((process.env.PROVIDER as PaymentProviderTag | undefined) ?? "stripe"),
    Options.withDescription("Payment provider to sync against.")
  ),
  environment: Options.choice("env", ["sandbox", "production"] as const).pipe(
    Options.withDefault(
      ((process.env.STRIPE_ENVIRONMENT ?? process.env.PADDLE_ENVIRONMENT) as PaymentEnvironmentTag | undefined) ??
        "sandbox"
    ),
    Options.withDescription("Provider environment.")
  ),
  database: Options.choice("database", ["sqlite", "postgres", "cloudflare-d1"] as const).pipe(
    Options.withDefault((process.env.PURCHASE_DATABASE as DatabaseKind | undefined) ?? "sqlite"),
    Options.withDescription("Database backend.")
  ),
  databaseUrl: Options.text("database-url").pipe(
    Options.optional,
    Options.withDescription("Database URL for sqlite or postgres. Supports sqlite:<file> and postgresql://...")
  ),
  cloudflareAccountId: Options.text("cloudflare-account-id").pipe(
    Options.optional,
    Options.withDescription("Cloudflare account id. Defaults to CLOUDFLARE_ACCOUNT_ID.")
  ),
  cloudflareD1DatabaseId: Options.text("cloudflare-d1-database-id").pipe(
    Options.optional,
    Options.withDescription("Cloudflare D1 database id. Defaults to CLOUDFLARE_D1_DATABASE_ID.")
  ),
  cloudflareApiToken: Options.text("cloudflare-api-token").pipe(
    Options.optional,
    Options.withDescription("Cloudflare API token. Defaults to CLOUDFLARE_API_TOKEN.")
  ),
  cloudflareApiBaseUrl: Options.text("cloudflare-api-base-url").pipe(
    Options.optional,
    Options.withDescription("Cloudflare API base URL. Defaults to https://api.cloudflare.com/client/v4.")
  ),
  apply: Options.boolean("apply").pipe(Options.withDescription("Apply the plan.")),
  dryRun: Options.boolean("dry-run").pipe(Options.withDescription("Print the plan without writes or provider calls.")),
  json: Options.boolean("json").pipe(Options.withDescription("Print the raw sync result as JSON.")),
  stripeApiKey: Options.text("stripe-api-key").pipe(
    Options.optional,
    Options.withDescription("Stripe API key. Defaults to STRIPE_API_KEY.")
  ),
  stripeWebhookSecret: Options.text("stripe-webhook-secret").pipe(
    Options.optional,
    Options.withDescription("Stripe webhook secret. Defaults to STRIPE_WEBHOOK_SECRET.")
  ),
  paddleApiToken: Options.text("paddle-api-token").pipe(
    Options.optional,
    Options.withDescription("Paddle API token. Defaults to PADDLE_API_TOKEN.")
  ),
  paddleWebhookToken: Options.text("paddle-webhook-token").pipe(
    Options.optional,
    Options.withDescription("Paddle webhook token. Defaults to PADDLE_WEBHOOK_TOKEN.")
  )
}

export const catalogSyncCommand = Command.make(
  "sync",
  catalogSyncOptions,
  Effect.fn(function* (config) {
    const options = parseCatalogSyncOptions(config)
    const catalog = yield* Effect.promise(() => loadPurchaseConfigModule(options))

    yield* checkCatalogSchema

    const layer = Layer.mergeAll(
      CatalogState.make({ plans: catalog.plans, products: catalog.products }),
      PurchaseStorageAdapter.make().pipe(Layer.provide(makeDatabaseLayer(options.database))),
      makeProviderLayer(options.provider)
    )

    const result = yield* sync({ dryRun: options.dryRun }).pipe(Effect.provide(layer))

    if (options.json) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(formatCatalogSyncResult(options, result))
    }
  })
).pipe(Command.withDescription("Plan or apply catalog changes to a payment provider and local projection store."))
