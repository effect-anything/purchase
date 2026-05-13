import type * as Layer from "effect/Layer"

import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"
import * as PgClient from "@effect/sql-pg/PgClient"
import * as SQLite from "@effect/sql-sqlite-node/SqliteClient"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"
import * as Schema from "effect/Schema"
import * as EffectString from "effect/String"

import type { PaymentEnvironmentTag, PaymentProviderTag } from "../provider/types.ts"

import * as CloudflareD1HttpClient from "../internal/cloudflare-d1-http-client.ts"
import { Paddle } from "../paddle.ts"
import { Stripe } from "../stripe.ts"
import {
  type CommercialCatalogSyncPlan,
  type CommercialCatalogSyncResult,
  PurchaseConfigLayer,
  syncCatalog
} from "../sync/config-service.ts"
import { loadPurchaseConfigModule, type PurchaseConfigModule } from "./config-loader.ts"

type CliCommand = "catalog.sync"

type DatabaseKind = "cloudflare-d1" | "postgres" | "sqlite"

type DatabaseTarget =
  | { readonly _tag: "postgres"; readonly url: string }
  | { readonly _tag: "sqlite"; readonly filename: string; readonly label: string }
  | {
      readonly _tag: "cloudflare-d1"
      readonly accountId: string
      readonly databaseId: string
      readonly apiToken: string
      readonly baseUrl?: string | undefined
    }

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

class PayCatalogCliSchemaNotReady extends Schema.TaggedError<PayCatalogCliSchemaNotReady>()(
  "PayCatalogCliSchemaNotReady",
  {
    message: Schema.String,
    cause: Schema.String
  }
) {}

class PayCatalogCliInvalidDatabase extends Schema.TaggedError<PayCatalogCliInvalidDatabase>()(
  "PayCatalogCliInvalidDatabase",
  {
    message: Schema.String
  }
) {}

const makeProviderLayer = (options: CliOptions): Layer.Layer<any, unknown> => {
  if (options.provider === "stripe") {
    return Stripe.layerConfig({
      apiKey: Redacted.make(options.stripeApiKey ?? ""),
      webhookSecret: Redacted.make(options.stripeWebhookSecret ?? ""),
      environment: options.environment
    })
  }

  return Paddle.layerConfig({
    apiToken: Redacted.make(options.paddleApiToken ?? ""),
    webhookToken: Redacted.make(options.paddleWebhookToken ?? ""),
    environment: options.environment
  })
}

const sqliteFilenameFromUrl = (databaseUrl: string) => {
  if (databaseUrl === "sqlite::memory:" || databaseUrl === "sqlite://:memory:") {
    return ":memory:"
  }

  if (databaseUrl.startsWith("sqlite://")) {
    return databaseUrl.slice("sqlite://".length)
  }

  if (databaseUrl.startsWith("sqlite:")) {
    return databaseUrl.slice("sqlite:".length)
  }

  return databaseUrl
}

const makeDatabaseLayer = (options: CliOptions): Layer.Layer<SqlClient.SqlClient, unknown> => {
  if (options.database._tag === "postgres") {
    return PgClient.layer({
      url: Redacted.make(options.database.url),
      transformQueryNames: EffectString.camelToSnake,
      transformResultNames: EffectString.snakeToCamel
    }) as Layer.Layer<SqlClient.SqlClient, unknown>
  }

  if (options.database._tag === "cloudflare-d1") {
    return CloudflareD1HttpClient.layer({
      accountId: options.database.accountId,
      databaseId: options.database.databaseId,
      apiToken: Redacted.make(options.database.apiToken),
      baseUrl: options.database.baseUrl,
      transformQueryNames: EffectString.camelToSnake,
      transformResultNames: EffectString.snakeToCamel
    }) as Layer.Layer<SqlClient.SqlClient, unknown>
  }

  return SQLite.layer({
    filename: options.database.filename,
    disableWAL: true,
    transformQueryNames: EffectString.camelToSnake,
    transformResultNames: EffectString.snakeToCamel
  }) as Layer.Layer<SqlClient.SqlClient, unknown>
}

const databaseLabel = (database: DatabaseTarget) => {
  switch (database._tag) {
    case "postgres":
      return database.url
    case "sqlite":
      return database.label
    case "cloudflare-d1":
      return `cloudflare-d1:${database.databaseId}`
  }
}

const catalogSchemaTables = ["paykit_product", "paykit_provider_ref"] as const

const checkCatalogSchema = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  yield* Effect.forEach(
    catalogSchemaTables,
    (table) =>
      sql.unsafe(`SELECT 1 FROM ${table} LIMIT 1`).withoutTransform.pipe(
        Effect.mapError(
          (cause) =>
            new PayCatalogCliSchemaNotReady({
              message: `Pay catalog schema is not ready: missing or unreadable table "${table}". Run pay migrations before catalog sync.`,
              cause: String(cause)
            })
        )
      ),
    { concurrency: 1, discard: true }
  )
})

const countPlanChanges = (plan: CommercialCatalogSyncPlan) =>
  plan.productsToCreate.length +
  plan.pricesToCreate.length +
  plan.localRowsToInsert.length +
  plan.localRowsToUpdate.length +
  plan.providerRefsToInsert.length +
  plan.providerRefsToUpdate.length +
  plan.staleRows.length +
  plan.archiveCandidates.length

const appendRows = (lines: Array<string>, title: string, rows: ReadonlyArray<string>) => {
  if (rows.length === 0) {
    return
  }

  lines.push("", title)
  for (const row of rows) {
    lines.push(`  ${row}`)
  }
}

export const formatHumanResult = (options: CliOptions, result: CommercialCatalogSyncResult) => {
  const lines = [
    "Connected",
    `  Database · ${databaseLabel(options.database)}`,
    `  Provider · ${result.provider} (${options.environment})`,
    `  Mode     · ${result.dryRun ? "dry-run" : "apply"}`,
    "",
    "Schema",
    "  Up to date"
  ]

  const plan = result.plan
  const changes = countPlanChanges(plan)
  lines.push("", "Plan changes")
  if (changes === 0) {
    lines.push("  No changes")
  } else {
    appendRows(
      lines,
      "  Products to create",
      plan.productsToCreate.map((entry) => `+ ${entry.productId} -> ${entry.providerProductId} (${entry.ownership})`)
    )
    appendRows(
      lines,
      "  Prices to create",
      plan.pricesToCreate.map(
        (entry) => `+ ${entry.offerId} -> ${entry.providerOfferId} (${entry.reason}, ${entry.ownership})`
      )
    )
    appendRows(lines, "  Local rows", [
      ...plan.localRowsToInsert.map((entry) => `+ ${entry.offerId} (${entry.reason})`),
      ...plan.localRowsToUpdate.map((entry) => `~ ${entry.offerId} (${entry.reason})`)
    ])
    appendRows(lines, "  Provider refs", [
      ...plan.providerRefsToInsert.map((entry) => `+ ${entry.ownerType}:${entry.ownerId} -> ${entry.providerId}`),
      ...plan.providerRefsToUpdate.map((entry) => `~ ${entry.ownerType}:${entry.ownerId} -> ${entry.providerId}`)
    ])
    appendRows(
      lines,
      "  Stale rows",
      plan.staleRows.map((entry) => `- ${entry.offerId} (${entry.reason})`)
    )
    appendRows(
      lines,
      "  Archive candidates",
      plan.archiveCandidates.map(
        (entry) =>
          `${entry.safeToArchive ? "~" : "!"} ${entry.ownerType}:${entry.ownerId} -> ${entry.providerId} (${entry.action})`
      )
    )
  }

  lines.push("", `Done · ${result.offers} offers ${result.dryRun ? "planned" : "synced"}`)
  return lines.join("\n")
}

export const printHumanResult = (options: CliOptions, result: CommercialCatalogSyncResult) => {
  console.log(formatHumanResult(options, result))
}

const runCatalogSync = (
  options: CliOptions,
  catalog: PurchaseConfigModule
): Effect.Effect<CommercialCatalogSyncResult, unknown> =>
  Effect.gen(function* () {
    yield* checkCatalogSchema
    return yield* syncCatalog({ dryRun: options.dryRun })
  }).pipe(
    Effect.provide(
      PurchaseConfigLayer({
        plans: catalog.plans as never,
        products: catalog.products as never
      })
    ),
    Effect.provide(makeProviderLayer(options)),
    Effect.provide(makeDatabaseLayer(options))
  ) as Effect.Effect<CommercialCatalogSyncResult, unknown>

const optionalValue = <A>(option: Option.Option<A>) => Option.getOrUndefined(option)

const envFallback = (value: Option.Option<string>, envName: string) => optionalValue(value) ?? process.env[envName]

export const parseDatabaseTarget = (config: {
  readonly database: DatabaseKind
  readonly databaseUrl: Option.Option<string>
  readonly cloudflareAccountId: Option.Option<string>
  readonly cloudflareApiToken: Option.Option<string>
  readonly cloudflareD1DatabaseId: Option.Option<string>
  readonly cloudflareApiBaseUrl: Option.Option<string>
}): DatabaseTarget => {
  if (config.database === "cloudflare-d1") {
    const accountId = optionalValue(config.cloudflareAccountId) ?? process.env.CLOUDFLARE_ACCOUNT_ID
    const databaseId =
      optionalValue(config.cloudflareD1DatabaseId) ??
      process.env.CLOUDFLARE_D1_DATABASE_ID ??
      process.env.CLOUDFLARE_DATABASE_ID
    const apiToken = optionalValue(config.cloudflareApiToken) ?? process.env.CLOUDFLARE_API_TOKEN

    if (!accountId) {
      throw new PayCatalogCliInvalidDatabase({
        message: "Missing --cloudflare-account-id or CLOUDFLARE_ACCOUNT_ID."
      })
    }
    if (!databaseId) {
      throw new PayCatalogCliInvalidDatabase({
        message: "Missing --cloudflare-d1-database-id or CLOUDFLARE_D1_DATABASE_ID."
      })
    }
    if (!apiToken) {
      throw new PayCatalogCliInvalidDatabase({
        message: "Missing --cloudflare-api-token or CLOUDFLARE_API_TOKEN."
      })
    }

    return {
      _tag: "cloudflare-d1",
      accountId,
      databaseId,
      apiToken,
      baseUrl: optionalValue(config.cloudflareApiBaseUrl) ?? process.env.CLOUDFLARE_API_BASE_URL
    }
  }

  const databaseUrl = optionalValue(config.databaseUrl) ?? process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new PayCatalogCliInvalidDatabase({
      message:
        config.database === "postgres"
          ? "Missing --database-url <postgres-url> or DATABASE_URL."
          : "Missing --database-url <sqlite-url> or DATABASE_URL."
    })
  }

  if (config.database === "postgres") {
    if (!databaseUrl.startsWith("postgres:") && !databaseUrl.startsWith("postgresql:")) {
      throw new PayCatalogCliInvalidDatabase({
        message: `Invalid postgres database URL "${databaseUrl}". Expected postgresql://...`
      })
    }
    return { _tag: "postgres", url: databaseUrl }
  }

  return {
    _tag: "sqlite",
    filename: sqliteFilenameFromUrl(databaseUrl),
    label: databaseUrl
  }
}

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
    exportName: optionalValue(config.exportName),
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
  module: textOption("module", "Module exporting plans/products or a BaseSDK subclass."),
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
} as const

export const catalogSyncCommand = Command.make("sync", catalogSyncOptions, (config) =>
  Effect.tryPromise({
    try: async () => {
      const options = parseCatalogSyncOptions(config)
      const catalog = await loadPurchaseConfigModule(options)
      return {
        options,
        result: await Effect.runPromise(runCatalogSync(options, catalog))
      }
    },
    catch: (error) => error
  }).pipe(
    Effect.tap(({ options, result }) =>
      Effect.sync(() => {
        if (options.json) {
          console.log(JSON.stringify(result, null, 2))
        } else {
          printHumanResult(options, result)
        }
      })
    ),
    Effect.asVoid
  )
).pipe(Command.withDescription("Plan or apply catalog changes to a payment provider and local projection store."))
