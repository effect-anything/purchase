import { Testing } from "@effect-x/server-testing/test"
import { NodeContext } from "@effect/platform-node"
import * as SqlD1 from "@effect/sql-d1/D1Client"
import { Cause, Context, Effect, Exit, FiberRef, Layer, LogLevel, ManagedRuntime, String } from "effect"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

import * as WorkersTesting from "../src/testing/workers.ts"
import { isD1, Miniflare, reset, setup, simple } from "../src/testing/workers.ts"

const tsconfig = resolve(import.meta.dirname, "..", "tsconfig.json")
const fixtures = resolve(import.meta.dirname, "fixtures")

const makeRuntime = async () => {
  const runtime = ManagedRuntime.make(
    Layer.provideMerge(
      simple({
        persist: false,
        configs: {
          name: "cloudflare-workers-state",
          modules: true,
          bindings: {
            NAME: "cloudflare-workers-state",
            NAMESPACE: "cloudflare"
          },
          script: `
            export default {
              async fetch(request, env) {
                const url = new URL(request.url)

                if (url.pathname === "/seed") {
                  await env.APP_DB.exec("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);")
                  await env.APP_DB.exec("CREATE TABLE posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT);")
                  await env.APP_DB.exec("INSERT INTO users (name) VALUES ('Ada');")
                  await env.APP_DB.exec("INSERT INTO posts (title) VALUES ('Hello');")
                  await env.APP_KV.put("first", "1")
                  await env.APP_KV.put("second", "2")
                  await env.FILES_BUCKET.put("a.txt", "A")
                  await env.FILES_BUCKET.put("b.txt", "B")

                  return Response.json({ ok: true })
                }

                if (url.pathname === "/state") {
                  const tables = await env.APP_DB.prepare(
                    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
                  ).run()
                  const keys = await env.APP_KV.list({ limit: 1000 })
                  const objects = await env.FILES_BUCKET.list({ limit: 1000 })

                  return Response.json({
                    tables: tables.results.map((row) => row.name),
                    keys: keys.keys,
                    objects: objects.objects,
                  })
                }

                return new Response("ok")
              },
            }
          `,
          d1Databases: {
            APP_DB: "cloudflare-workers-db"
          },
          kvNamespaces: {
            APP_KV: "cloudflare-workers-kv"
          },
          r2Buckets: {
            FILES_BUCKET: "cloudflare-workers-bucket"
          }
        }
      }),
      NodeContext.layer
    )
  )

  await runtime.runtime()

  return runtime
}

const readJson = (response: Response) => Effect.promise(() => response.json() as Promise<any>)

const makeTestingRuntime = async (
  layer: Layer.Layer<
    Layer.Layer.Success<ReturnType<typeof WorkersTesting.simple>>,
    never,
    Layer.Layer.Context<ReturnType<typeof WorkersTesting.simple>>
  >
) => {
  const runtime = ManagedRuntime.make(Layer.provideMerge(layer, NodeContext.layer))

  await runtime.runtime()

  const testing = await runtime.runPromise(
    Effect.map(Effect.context<Testing>(), (context) => Context.get(context, Testing))
  )

  return {
    runtime,
    testing
  }
}

describe("cloudflare workers testing helpers", () => {
  it("isD1 narrows to a real Miniflare D1 database and safely rejects invalid values", async () => {
    const runtime = await makeRuntime()
    const throwing = {
      get prepare() {
        throw new Error("nope")
      }
    }

    try {
      const d1 = await runtime.runPromise(Effect.flatMap(Miniflare, (miniflare) => miniflare.getD1Database("APP_DB")))

      expect(isD1(d1)).toBe(true)
      expect(isD1({ prepare() {}, exec() {} })).toBe(true)
      expect(isD1({ prepare() {} })).toBeFalsy()
      expect(isD1(throwing)).toBe(false)
    } finally {
      await runtime.dispose()
    }
  })

  it("setup.withMigration executes SQL statements against a real Miniflare D1 database", async () => {
    const runtime = await makeRuntime()

    try {
      await runtime.runPromise(
        setup
          .withMigration(`
            CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
            INSERT INTO users (name) VALUES ('Ada');`)(Effect.void)
          .pipe(
            Effect.provide(
              Layer.unwrapEffect(
                Effect.gen(function* () {
                  const miniflare = yield* Miniflare
                  const db = yield* miniflare.getD1Database("APP_DB")

                  return SqlD1.layer({
                    db,
                    transformQueryNames: String.camelToSnake,
                    transformResultNames: String.snakeToCamel
                  })
                })
              )
            )
          )
      )

      const rows = await runtime.runPromise(
        Effect.gen(function* () {
          const miniflare = yield* Miniflare
          const db = yield* miniflare.getD1Database("APP_DB")
          return yield* Effect.promise(() => db.prepare("SELECT name FROM users ORDER BY id").run())
        })
      )

      expect(rows.results).toEqual([{ name: "Ada" }])
    } finally {
      await runtime.dispose()
    }
  })

  it("setup.withMigration dies when the sql client service is missing", async () => {
    const exit = await Effect.runPromiseExit(setup.withMigration("CREATE TABLE users (id INTEGER);")(Effect.void))

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      expect(globalThis.String(Cause.squash(exit.cause))).toContain("No sql client")
    }
  })

  it("reset.resetAll clears real D1 tables, KV keys, and R2 objects", async () => {
    const runtime = await makeRuntime()

    try {
      await runtime.runPromise(
        Effect.gen(function* () {
          const miniflare = yield* Miniflare
          const response = yield* miniflare.fetch("http://localhost/seed", {
            method: "POST"
          })

          return yield* readJson(response)
        })
      )

      await runtime.runPromise(reset.resetAll)

      const state = await runtime.runPromise(
        Effect.gen(function* () {
          const miniflare = yield* Miniflare
          const response = yield* miniflare.fetch("http://localhost/state")
          return yield* readJson(response)
        })
      )

      expect(state.tables).not.toContain("users")
      expect(state.tables).not.toContain("posts")
      expect(state.keys).toEqual([])
      expect(state.objects).toEqual([])
    } finally {
      await runtime.dispose()
    }
  })

  it("workers.simple runs an inline worker on real Miniflare and applies the explicit log level override", async () => {
    const { runtime, testing } = await makeTestingRuntime(
      WorkersTesting.simple({
        persist: false,
        logLevel: "Info",
        configs: {
          name: "cloudflare-inline-worker",
          modules: true,
          bindings: {
            NAME: "cloudflare-inline-worker",
            NAMESPACE: "cloudflare"
          },
          script: `
            export default {
              fetch(_request, env) {
                return Response.json({
                  name: env.NAME,
                  logLevel: env.LOG_LEVEL,
                  stage: env.STAGE,
                  test: env.TEST,
                })
              },
            }
          `
        }
      })
    )

    try {
      const json = await runtime.runPromise(
        Effect.gen(function* () {
          const miniflare = yield* WorkersTesting.Miniflare
          const response = yield* miniflare.fetch("http://localhost/")
          return yield* readJson(response)
        })
      )

      const level = await runtime.runPromise(testing.mapEffect(FiberRef.get(FiberRef.currentMinimumLogLevel), runtime))

      expect(json).toEqual({
        name: "cloudflare-inline-worker"
      })
      expect(level).toEqual(LogLevel.fromLiteral("Info"))
    } finally {
      await runtime.dispose()
    }
  })

  it("workers() boots a real wrangler project and its additional worker with bundling enabled by default", async () => {
    const { runtime } = await makeTestingRuntime(
      WorkersTesting.workers({
        cwd: resolve(fixtures, "service-app"),
        persist: false,
        tsconfig,
        env: {
          NAME: "cloudflare-service-app",
          NAMESPACE: "cloudflare"
        },
        additionalWorkers: [{ path: resolve(fixtures, "echo-service", "wrangler.jsonc") }]
      })
    )

    try {
      const json = await runtime.runPromise(
        Effect.gen(function* () {
          const miniflare = yield* WorkersTesting.Miniflare
          const response = yield* miniflare.fetch("http://localhost/service")
          return yield* readJson(response)
        })
      )

      expect(json).toEqual({
        app: "service-app",
        bindingName: "cloudflare-service-app",
        logLevel: "All",
        stage: "test",
        test: true,
        service: {
          service: "echo-service",
          pathname: "/through-app",
          method: "POST"
        }
      })
    } finally {
      await runtime.dispose()
    }
  })
})
