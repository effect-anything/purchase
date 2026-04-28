import type { Connection } from "@effect/sql/SqlConnection"
import type { ConfigError } from "effect/ConfigError"
import type * as Scope from "effect/Scope"

import * as Reactivity from "@effect/experimental/Reactivity"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpBody from "@effect/platform/HttpBody"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Client from "@effect/sql/SqlClient"
import { SqlError } from "@effect/sql/SqlError"
import * as Statement from "@effect/sql/Statement"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { identity, pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"
import * as Schema from "effect/Schema"

const ATTR_DB_SYSTEM_NAME = "db.system.name"

export const TypeId: unique symbol = Symbol.for("@effect-x/purchase/internal/CloudflareD1HttpClient")
export type TypeId = typeof TypeId

export interface CloudflareD1HttpClient extends Client.SqlClient {
  readonly [TypeId]: TypeId
  readonly config: CloudflareD1HttpClientConfig

  readonly updateValues: never
}

export const CloudflareD1HttpClient = Context.GenericTag<CloudflareD1HttpClient>(
  "@effect-x/purchase/internal/CloudflareD1HttpClient"
)

export interface CloudflareD1HttpClientConfig {
  readonly accountId: string
  readonly databaseId: string
  readonly apiToken: Redacted.Redacted<string>
  readonly baseUrl?: string | undefined
  readonly spanAttributes?: Record<string, unknown> | undefined
  readonly transformResultNames?: ((str: string) => string) | undefined
  readonly transformQueryNames?: ((str: string) => string) | undefined
}

const CloudflareD1ResultMeta = Schema.Struct({
  changed_db: Schema.optional(Schema.Boolean),
  changes: Schema.optional(Schema.Number),
  duration: Schema.optional(Schema.Number),
  last_row_id: Schema.optional(Schema.Number),
  rows_read: Schema.optional(Schema.Number),
  rows_written: Schema.optional(Schema.Number),
  size_after: Schema.optional(Schema.Number)
})

const CloudflareD1QueryResult = Schema.Struct({
  meta: Schema.optional(CloudflareD1ResultMeta),
  results: Schema.optional(Schema.Array(Schema.Record({ key: Schema.String, value: Schema.Unknown }))),
  success: Schema.Boolean
})

const CloudflareD1QueryEnvelope = Schema.Struct({
  errors: Schema.Array(Schema.Unknown),
  messages: Schema.Array(Schema.Unknown),
  result: Schema.Union(CloudflareD1QueryResult, Schema.Array(CloudflareD1QueryResult)),
  success: Schema.Boolean
})

type CloudflareD1QueryEnvelope = typeof CloudflareD1QueryEnvelope.Type
type CloudflareD1QueryResult = typeof CloudflareD1QueryResult.Type

const formatCloudflareErrors = (errors: ReadonlyArray<unknown>) =>
  errors.length === 0 ? "Cloudflare D1 query failed" : errors.map((error) => JSON.stringify(error)).join("; ")

const resultRows = (result: CloudflareD1QueryResult) => result.results ?? []

const normalizeQueryResult = (envelope: CloudflareD1QueryEnvelope) => {
  if (!envelope.success) {
    throw new SqlError({
      cause: envelope.errors,
      message: formatCloudflareErrors(envelope.errors)
    })
  }

  const result = Array.isArray(envelope.result) ? envelope.result[0] : envelope.result
  if (!result?.success) {
    throw new SqlError({
      cause: envelope.errors,
      message: formatCloudflareErrors(envelope.errors)
    })
  }

  return resultRows(result)
}

const valuesFromRows = (rows: ReadonlyArray<Record<string, unknown>>) =>
  rows.map((row) => Object.values(row) as ReadonlyArray<unknown>)

export const make = (
  options: CloudflareD1HttpClientConfig
): Effect.Effect<CloudflareD1HttpClient, never, Scope.Scope | Reactivity.Reactivity> =>
  Effect.gen(function* () {
    const compiler = Statement.makeCompilerSqlite(options.transformQueryNames)
    const transformRows = options.transformResultNames
      ? Statement.defaultTransforms(options.transformResultNames).array
      : undefined

    const baseUrl = options.baseUrl ?? "https://api.cloudflare.com/client/v4"
    const queryPath = `/accounts/${options.accountId}/d1/database/${options.databaseId}/query`
    const httpClient = (yield* HttpClient.HttpClient.pipe(Effect.provide(FetchHttpClient.layer))).pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(
          HttpClientRequest.prependUrl(baseUrl),
          HttpClientRequest.bearerToken(Redacted.value(options.apiToken)),
          HttpClientRequest.acceptJson,
          HttpClientRequest.setHeader("Content-Type", "application/json")
        )
      )
    )

    const runQuery = (sql: string, params: ReadonlyArray<unknown>) =>
      pipe(
        httpClient.post(queryPath, {
          body: HttpBody.unsafeJson({
            params,
            sql
          })
        }),
        Effect.flatMap(
          HttpClientResponse.matchStatus({
            200: (response) =>
              pipe(
                response,
                HttpClientResponse.schemaBodyJson(CloudflareD1QueryEnvelope),
                Effect.map(normalizeQueryResult),
                Effect.mapError((cause) => new SqlError({ cause, message: "Failed to decode D1 query response" }))
              ),
            orElse: (response) =>
              Effect.flatMap(
                Effect.orElseSucceed(response.text, () => "Unexpected Cloudflare D1 response"),
                (body) =>
                  Effect.fail(
                    new SqlError({
                      cause: body,
                      message: `Cloudflare D1 HTTP API returned status ${response.status}`
                    })
                  )
              )
          })
        ),
        Effect.mapError((cause) =>
          cause instanceof SqlError ? cause : new SqlError({ cause, message: "Failed to execute D1 query" })
        )
      )

    const makeConnection = Effect.sync(() =>
      identity<Connection>({
        execute(sql, params, transformRows) {
          const effect = runQuery(sql, params)
          return transformRows ? Effect.map(effect, transformRows) : effect
        },
        executeRaw(sql, params) {
          return runQuery(sql, params)
        },
        executeValues(sql, params) {
          return Effect.map(runQuery(sql, params), valuesFromRows)
        },
        executeUnprepared(sql, params, transformRows) {
          const effect = runQuery(sql, params)
          return transformRows ? Effect.map(effect, transformRows) : effect
        },
        executeStream(_sql, _params) {
          return Effect.dieMessage("executeStream not implemented")
        }
      })
    )

    const connection = yield* makeConnection
    const acquirer = Effect.succeed(connection)
    const transactionAcquirer = Effect.dieMessage("transactions are not supported in Cloudflare D1 HTTP API client")

    return Object.assign(
      (yield* Client.make({
        acquirer,
        compiler,
        transactionAcquirer,
        spanAttributes: [
          ...(options.spanAttributes ? Object.entries(options.spanAttributes) : []),
          [ATTR_DB_SYSTEM_NAME, "sqlite"]
        ],
        transformRows
      })) as CloudflareD1HttpClient,
      {
        [TypeId]: TypeId as TypeId,
        config: options
      }
    )
  })

export const layerConfig = (
  config: Config.Config.Wrap<CloudflareD1HttpClientConfig>
): Layer.Layer<CloudflareD1HttpClient | Client.SqlClient, ConfigError> =>
  Layer.scopedContext(
    Config.unwrap(config).pipe(
      Effect.flatMap(make),
      Effect.map((client) => Context.make(CloudflareD1HttpClient, client).pipe(Context.add(Client.SqlClient, client)))
    )
  ).pipe(Layer.provide(Reactivity.layer))

export const layer = (
  config: CloudflareD1HttpClientConfig
): Layer.Layer<CloudflareD1HttpClient | Client.SqlClient, ConfigError> =>
  Layer.scopedContext(
    Effect.map(make(config), (client) =>
      Context.make(CloudflareD1HttpClient, client).pipe(Context.add(Client.SqlClient, client))
    )
  ).pipe(Layer.provide(Reactivity.layer))
