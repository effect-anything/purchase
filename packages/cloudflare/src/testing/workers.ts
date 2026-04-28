import type { D1Database } from "@cloudflare/workers-types"
import { CloudflareBindings } from "../bindings.ts"
import {
  Miniflare,
  MiniflareLive,
  type TestWorkersConfigModule,
  type TestWorkersModule,
  type TestWorkersOptions
} from "../miniflare.ts"
import { Testing } from "@effect-x/server-testing/test"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Arr from "effect/Array"
import * as Context from "effect/Context"
import * as FiberRef from "effect/FiberRef"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as LogLevel from "effect/LogLevel"
import { pipe } from "effect/Function"
import type * as ManagedRuntime from "effect/ManagedRuntime"
import { resolve } from "node:path"

export { Miniflare }

export const isD1 = (value: any): value is D1Database => {
  try {
    return value.prepare && typeof value.prepare === "function" && value.exec && typeof value.exec === "function"
  } catch {
    return false
  }
}

const layer = (options: { logLevel?: LogLevel.Literal | undefined }) =>
  Layer.effect(
    Testing,
    Effect.gen(function* () {
      const mapEffect = <A, E, R extends never>(
        effect: Effect.Effect<A, E, R>,
        _managedRuntime: ManagedRuntime.ManagedRuntime<R, never>
      ) =>
        Effect.flatMap(
          Effect.gen(function* () {
            const miniflare = yield* Miniflare
            const bindings = yield* miniflare.getBindings()
            const logLevel = options.logLevel ? options.logLevel : (bindings.LOG_LEVEL as LogLevel.Literal)
            return { logLevel }
          }),
          ({ logLevel }) => {
            const program = pipe(
              effect,
              Effect.locally(FiberRef.currentMinimumLogLevel, LogLevel.fromLiteral(logLevel))
            )

            return program
          }
        )

      const beforeEach = Effect.void

      const afterEach = Effect.gen(function* () {
        yield* reset.resetAll
      })

      return {
        mapEffect,
        beforeEach,
        afterEach
      } as any
    })
  )

export const simple = (
  options: {
    configs?: Array<TestWorkersConfigModule> | TestWorkersConfigModule | undefined
    logLevel?: LogLevel.Literal
    additionalWorkers?: Array<TestWorkersModule> | undefined
  } & TestWorkersOptions = {}
) =>
  pipe(
    layer(options),
    Layer.provideMerge(MiniflareLive),
    Layer.provideMerge(
      Miniflare.Config(options, {
        configs: options.configs ? (Array.isArray(options.configs) ? options.configs : [options.configs]) : [],
        module: options.additionalWorkers ?? []
      })
    )
  )

export const workers = (
  options: {
    cwd: string
    bundle?: boolean | undefined
    logLevel?: LogLevel.Literal
    additionalWorkers?: Array<TestWorkersModule> | undefined
  } & TestWorkersOptions
) =>
  pipe(
    layer(options),
    Layer.provideMerge(MiniflareLive),
    Layer.provideMerge(
      Miniflare.Config(options, {
        module: [
          {
            path: resolve(options.cwd, "wrangler.jsonc"),
            bundle: options.bundle ?? true
          },
          ...(options.additionalWorkers ?? []).map((item) => {
            return {
              ...item,
              bundle: item.bundle ?? true
            }
          })
        ]
      })
    )
  )

const migration = (schemas: Array<string>) =>
  Layer.effectDiscard(
    Effect.gen(function* () {
      if (schemas.length > 0) {
        const context = yield* Effect.context<never>()

        const clientOption = Context.getOption(context, SqlClient.SqlClient)

        if (clientOption._tag === "None") {
          return yield* Effect.dieMessage("No sql client")
        }

        const sql = clientOption.value

        yield* Effect.forEach(schemas, (schema) => {
          const client = sql as any

          if (isD1(client?.config.db)) {
            const db = client.config.db as D1Database
            const sqls = schema
              .replace(/\n/g, "")
              .replace(/ {4}/g, "")
              .split(";")
              .filter((s) => s.trim() !== "")
              .map((s) => `${s};`)

            return Effect.forEach(sqls, (s) => Effect.tryPromise(() => db.exec(s)))
          }

          return Effect.void
        })
      }
    })
  )

export const resetMiniflare = Effect.gen(function* () {
  const bindings = yield* CloudflareBindings
  const d1Databases = yield* bindings.getD1Databases()
  const kvNamespaces = yield* bindings.getKVNamespaces()
  const r2Buckets = yield* bindings.getR2Buckets()

  yield* Effect.forEach(
    d1Databases,
    Effect.fnUntraced(function* (d1Database) {
      const d1 = d1Database

      yield* Effect.ignoreLogged(
        Effect.tryPromise(() =>
          d1
            .prepare("SELECT name FROM sqlite_master WHERE type='table'")
            .run()
            .then((result) => {
              const exclude = ["_cf_KV", "_cf_METADATA", "sqlite_sequence"]
              const tables = result.results.map((row) => row.name as string).filter((name) => !exclude.includes(name))
              const deletes = tables.map((table) => `DROP TABLE ${table};`)

              if (deletes.length === 0) return

              deletes.push("DELETE FROM sqlite_sequence;")

              return d1.batch(deletes.map((statement) => d1.prepare(statement)))
            })
        )
      )
    }),
    {
      discard: true
    }
  ).pipe(Effect.tapError((error) => Effect.logError(`Error resetting D1 databases: ${error}`)))

  yield* Effect.forEach(
    kvNamespaces,
    Effect.fnUntraced(function* (kvNamespace) {
      const kv = kvNamespace

      yield* Effect.ignoreLogged(
        Effect.tryPromise(() =>
          kv.list({ limit: 1000 }).then((results) => {
            if (results.keys.length === 0) return
            return Promise.all(results.keys.map((key) => kv.delete(key.name)))
          })
        )
      )
    }),
    {
      discard: true
    }
  ).pipe(Effect.tapError((error) => Effect.logError(`Error resetting KV namespaces: ${error}`)))

  yield* Effect.forEach(
    r2Buckets,
    Effect.fnUntraced(function* (r2Bucket) {
      const r2 = r2Bucket

      yield* Effect.ignoreLogged(
        Effect.tryPromise(() =>
          r2.list({ limit: 1000 }).then((results) => {
            const keys =
              (results as any as { keys?: Array<string> }).keys ||
              results.objects.map((object) => (typeof object === "string" ? object : object.key))
            if (keys.length === 0) return
            return r2.delete(keys)
          })
        )
      )
    }),
    {
      discard: true
    }
  ).pipe(Effect.tapError((error) => Effect.logError(`Error resetting R2 buckets: ${error}`)))
})

export const reset = {
  resetAll: Effect.gen(function* () {
    yield* resetMiniflare
  })
}

export const setup = {
  withMigration:
    (schemas: string | Array<string>) =>
    <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      effect.pipe(Effect.provide(migration(Arr.ensure(schemas))))
}
