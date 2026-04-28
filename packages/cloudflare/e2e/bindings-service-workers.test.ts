import * as W from "../src/testing/workers.ts"
import * as Test from "@effect-x/server-testing/workers"
import { NodeContext } from "@effect/platform-node"
import { expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { basename, resolve } from "node:path"

const TestLive = W.workers({
  persist: basename(import.meta.url),
  cwd: resolve(import.meta.dirname, "fixtures/bindings-service-worker"),
  tsconfig: resolve(import.meta.dirname, "../tsconfig.json"),
  env: {
    APP_NAME: "bindings-service-worker",
    FEATURE_ENABLED: "true",
    NAME: "bindings-service-worker",
    NAMESPACE: "cloudflare-bindings-e2e",
    RETRY_COUNT: "9",
    "SYNC.URL": "https://sync.bindings.example.com"
  },
  additionalWorkers: [{ path: resolve(import.meta.dirname, "fixtures/echo-service/wrangler.jsonc") }]
}).pipe(Layer.provideMerge(NodeContext.layer))

const fetchJson = Effect.fn("fetchJson")(function* (path: string, init?: RequestInit | undefined) {
  const w = yield* W.Miniflare
  const response = yield* w.fetch(`http://localhost${path}`, init)
  expect(response.status).toBe(200)
  return yield* Effect.promise(() => response.json() as Promise<any>)
})

Test.test(TestLive)("Cloudflare bindings/service workers", (it) => {
  it.effect(
    "reads real bindings and env values from the worker runtime",
    Effect.fn(function* () {
      const json = yield* fetchJson("/bindings")

      expect(json).toEqual({
        hasDb: true,
        hasKv: true,
        hasBucket: true,
        hasQueue: true,
        hasService: true,
        env: {
          APP_NAME: "bindings-service-worker",
          FEATURE_ENABLED: "true",
          LOG_LEVEL: "All",
          NAME: "bindings-service-worker",
          NAMESPACE: "cloudflare-bindings-e2e",
          NODE_ENV: "development",
          RETRY_COUNT: "9",
          "SYNC.URL": "https://sync.bindings.example.com",
          STAGE: "test",
          TEST: true
        }
      })
    })
  )

  it.effect(
    "reads config values through the real config provider",
    Effect.fn(function* () {
      const json = yield* fetchJson("/config")

      expect(json).toEqual({
        appName: "bindings-service-worker",
        name: "bindings-service-worker",
        namespace: "cloudflare-bindings-e2e",
        featureEnabled: true,
        retryCount: 9,
        syncUrl: "https://sync.bindings.example.com"
      })
    })
  )

  it.effect(
    "routes unknown paths into the real HttpApi layer",
    Effect.fn(function* () {
      const json = yield* fetchJson("/_health")

      expect(json).toEqual({
        ok: true
      })
    })
  )

  it.effect(
    "composes WorkerService with a real service binding and header forwarding",
    Effect.fn(function* () {
      const json = yield* fetchJson("/service", {
        headers: {
          authorization: "Bearer context",
          "x-request-id": "request-1",
          "accept-language": "zh-CN",
          "x-private": "blocked"
        }
      })

      expect(json.method).toBe("GET")
      expect(json.url).toBe("http://localhost/echo")
      expect(json.headers.authorization).toBe("Bearer explicit")
      expect(json.headers["user-agent"]).toBe("bindings-service-worker")
      expect(json.headers["x-request-id"]).toBe("request-1")
      expect(json.headers["accept-language"]).toBe("zh-CN")
      expect(json.headers["x-private"]).toBeUndefined()
    })
  )

  it.effect(
    "retries transient service responses against a real worker binding",
    Effect.fn(function* () {
      const json = yield* fetchJson("/service-retry")

      expect(json).toEqual({
        attempts: 3
      })
    })
  )
})
