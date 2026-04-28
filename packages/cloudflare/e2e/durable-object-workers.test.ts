import * as W from "../src/testing/workers.ts"
import * as Test from "@effect-x/server-testing/workers"
import { NodeContext } from "@effect/platform-node"
import { expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { basename, resolve } from "node:path"

const TestLive = W.workers({
  persist: basename(import.meta.url),
  cwd: resolve(import.meta.dirname, "fixtures/durable-object-worker"),
  tsconfig: resolve(import.meta.dirname, "../tsconfig.json"),
  env: {
    NAME: "durable-object-worker",
    NAMESPACE: "cloudflare-durable-object-e2e"
  }
}).pipe(Layer.provideMerge(NodeContext.layer))

const fetchJson = Effect.fn("fetchJson")(function* (path: string, init?: RequestInit | undefined) {
  const w = yield* W.Miniflare
  const response = yield* w.fetch(`http://localhost${path}`, init)
  expect(response.status).toBe(200)
  return yield* Effect.promise(() => response.json() as Promise<any>)
})

Test.test(TestLive)("Cloudflare durable object workers", (it) => {
  it.effect(
    "runs real durable object RPC calls through wrapStub and preserves state across calls",
    Effect.fn(function* () {
      const name = `alpha-${crypto.randomUUID()}`
      const hasBinding = yield* fetchJson("/do/bindings")
      const first = yield* fetchJson(`/do/increment?name=${name}&by=2`, { method: "POST" })
      const second = yield* fetchJson(`/do/increment?name=${name}&by=3`, { method: "POST" })
      const current = yield* fetchJson(`/do/current?name=${name}`)

      expect(hasBinding).toEqual({
        hasDurableObject: true
      })
      expect(first).toEqual({
        value: 2
      })
      expect(second).toEqual({
        value: 5
      })
      expect(current).toEqual({
        value: 5
      })
    })
  )

  it.effect(
    "maps real durable object RPC failures into RPCError values",
    Effect.fn(function* () {
      const name = `alpha-${crypto.randomUUID()}`
      const json = yield* fetchJson(`/do/error?name=${name}`)

      expect(json.tag).toBe("RPCError")
      expect(json.message).toBe("boom:broken")
      expect(json.reason).toContain("boom:broken")
    })
  )
})
