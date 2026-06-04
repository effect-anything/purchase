import type * as SqlError from "@effect/sql/SqlError"
import type * as ConfigError from "effect/ConfigError"
import type * as Layer from "effect/Layer"

import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"
import * as PgClient from "@effect/sql-pg/PgClient"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"
import * as Schema from "effect/Schema"
import * as EffectString from "effect/String"

import * as CloudflareD1HttpClient from "../internal/cloudflare-d1-http-client.ts"
import * as SQLite from "../internal/node-sqlite-client.ts"

export type DatabaseKind = "cloudflare-d1" | "postgres" | "sqlite"

export type DatabaseTarget =
  | { readonly _tag: "postgres"; readonly url: string }
  | { readonly _tag: "sqlite"; readonly filename: string; readonly label: string }
  | {
      readonly _tag: "cloudflare-d1"
      readonly accountId: string
      readonly databaseId: string
      readonly apiToken: string
      readonly baseUrl?: string | undefined
    }

export class PurchaseCatalogInvalidDatabase extends Schema.TaggedError<PurchaseCatalogInvalidDatabase>()(
  "PurchaseCatalogInvalidDatabase",
  {
    message: Schema.String
  }
) {}

export const sqliteFilenameFromUrl = (databaseUrl: string) => {
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

export const makeDatabaseLayer = (
  databaseTarget: DatabaseTarget
): Layer.Layer<SqlClient.SqlClient, SqlError.SqlError | ConfigError.ConfigError, never> => {
  if (databaseTarget._tag === "postgres") {
    return PgClient.layer({
      url: Redacted.make(databaseTarget.url),
      transformQueryNames: EffectString.camelToSnake,
      transformResultNames: EffectString.snakeToCamel
    })
  }

  if (databaseTarget._tag === "cloudflare-d1") {
    return CloudflareD1HttpClient.layer({
      accountId: databaseTarget.accountId,
      databaseId: databaseTarget.databaseId,
      apiToken: Redacted.make(databaseTarget.apiToken),
      baseUrl: databaseTarget.baseUrl,
      transformQueryNames: EffectString.camelToSnake,
      transformResultNames: EffectString.snakeToCamel
    })
  }

  return SQLite.layer({
    filename: databaseTarget.filename,
    disableWAL: true,
    transformQueryNames: EffectString.camelToSnake,
    transformResultNames: EffectString.snakeToCamel
  })
}

export const databaseLabel = (database: DatabaseTarget) => {
  switch (database._tag) {
    case "postgres":
      return database.url
    case "sqlite":
      return database.label
    case "cloudflare-d1":
      return `cloudflare-d1:${database.databaseId}`
  }
}

class PurchaseCatalogSchemaNotReady extends Schema.TaggedError<PurchaseCatalogSchemaNotReady>()(
  "PurchaseCatalogSchemaNotReady",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

const catalogSchemaTables = ["paykit_product", "paykit_provider_ref"] as const

export const checkCatalogSchema = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  yield* Effect.forEach(
    catalogSchemaTables,
    (table) =>
      sql.unsafe(`SELECT 1 FROM ${table} LIMIT 1`).withoutTransform.pipe(
        Effect.mapError(
          (cause) =>
            new PurchaseCatalogSchemaNotReady({
              message: `Pay catalog schema is not ready: missing or unreadable table "${table}". Run pay migrations before catalog sync.`,
              cause
            })
        )
      ),
    { concurrency: 1, discard: true }
  )
})

export const parseDatabaseTarget = (config: {
  readonly database: DatabaseKind
  readonly databaseUrl: Option.Option<string>
  readonly cloudflareAccountId: Option.Option<string>
  readonly cloudflareApiToken: Option.Option<string>
  readonly cloudflareD1DatabaseId: Option.Option<string>
  readonly cloudflareApiBaseUrl: Option.Option<string>
}): DatabaseTarget => {
  if (config.database === "cloudflare-d1") {
    const accountId = Option.getOrElse(config.cloudflareAccountId, () => process.env.CLOUDFLARE_ACCOUNT_ID)
    const databaseId = Option.getOrElse(
      config.cloudflareD1DatabaseId,
      () => process.env.CLOUDFLARE_D1_DATABASE_ID ?? process.env.CLOUDFLARE_DATABASE_ID
    )
    const apiToken = Option.getOrElse(config.cloudflareApiToken, () => process.env.CLOUDFLARE_API_TOKEN)

    if (!accountId) {
      throw new PurchaseCatalogInvalidDatabase({
        message: "Missing --cloudflare-account-id or CLOUDFLARE_ACCOUNT_ID."
      })
    }
    if (!databaseId) {
      throw new PurchaseCatalogInvalidDatabase({
        message: "Missing --cloudflare-d1-database-id or CLOUDFLARE_D1_DATABASE_ID."
      })
    }
    if (!apiToken) {
      throw new PurchaseCatalogInvalidDatabase({
        message: "Missing --cloudflare-api-token or CLOUDFLARE_API_TOKEN."
      })
    }

    const baseUrl = Option.getOrElse(config.cloudflareApiBaseUrl, () => process.env.CLOUDFLARE_API_BASE_URL)

    return {
      _tag: "cloudflare-d1",
      accountId,
      databaseId,
      apiToken,
      baseUrl
    }
  }

  const databaseUrl = Option.getOrElse(config.databaseUrl, () => process.env.DATABASE_URL)

  if (!databaseUrl) {
    throw new PurchaseCatalogInvalidDatabase({
      message:
        config.database === "postgres"
          ? "Missing --database-url <postgres-url> or DATABASE_URL."
          : "Missing --database-url <sqlite-url> or DATABASE_URL."
    })
  }

  if (config.database === "postgres") {
    if (!databaseUrl.startsWith("postgres:") && !databaseUrl.startsWith("postgresql:")) {
      throw new PurchaseCatalogInvalidDatabase({
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
