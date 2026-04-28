import * as W from "../src/testing/workers.ts"
import * as Test from "@effect-x/server-testing/workers"
import { NodeContext } from "@effect/platform-node"
import { expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { basename, resolve } from "node:path"

const TestLive = W.workers({
  persist: basename(import.meta.url),
  cwd: resolve(import.meta.dirname, "fixtures/storage-worker"),
  tsconfig: resolve(import.meta.dirname, "../tsconfig.json"),
  env: {
    NAME: "storage-worker",
    NAMESPACE: "cloudflare-storage-e2e"
  }
}).pipe(Layer.provideMerge(NodeContext.layer))

const fetchJson = (path: string, init?: RequestInit | undefined) =>
  Effect.gen(function* () {
    const w = yield* W.Miniflare
    const response = yield* w.fetch(`http://localhost${path}`, init)

    expect(response.status).toBe(200)
    return yield* Effect.promise(() => response.json() as Promise<any>)
  })

Test.test(TestLive)("Cloudflare storage workers", (it) => {
  it.effect(
    "round-trips KV and R2 data through the real worker runtime",
    Effect.fn(function* () {
      const json = yield* fetchJson("/storage")

      expect(json.kvValue).toBe("hello from kv")
      expect(json.r2Value).toBe("hello from r2")
      expect(json.customMetadata).toEqual({ source: "e2e" })
      expect(json.httpMetadata).toEqual({ contentType: "text/plain" })
      expect(json.size).toBeGreaterThan(0)
      expect(typeof json.etag).toBe("string")
    })
  )

  it.effect(
    "runs KV json, metadata, binary, stream, and list operations against a real namespace",
    Effect.fn(function* () {
      const json = yield* fetchJson("/storage/kv-details")

      expect(json).toEqual({
        jsonValue: {
          hello: "world",
          count: 2
        },
        metadataValue: "meta-value",
        metadata: {
          version: 1,
          source: "storage-worker"
        },
        binaryText: "ABC",
        streamText: "streamed-value",
        listedKeys: ["kv/binary", "kv/json", "kv/meta", "kv/stream"]
      })
    })
  )

  it.effect(
    "runs R2 list, range, and delete operations against a real bucket",
    Effect.fn(function* () {
      const json = yield* fetchJson("/storage/r2-details")

      expect(json).toEqual({
        listedBeforeDelete: ["r2/a.txt", "r2/b.txt"],
        rangedText: "bcd",
        listedAfterDelete: ["r2/a.txt"]
      })
    })
  )

  it.effect(
    "runs Cache API operations against Miniflare caches",
    Effect.fn(function* () {
      const put = yield* fetchJson("/cache/put", { method: "POST" })
      const read = yield* fetchJson("/cache/read")
      const deleted = yield* fetchJson("/cache/delete", { method: "POST" })

      expect(put).toEqual({
        stored: true
      })
      expect(read).toEqual({
        defaultText: "default-cache",
        namedText: "named-cache"
      })
      expect(deleted).toEqual({
        defaultDeleted: true,
        defaultAfterDelete: false,
        namedDeleted: true,
        namedAfterDelete: false
      })
    })
  )

  it.effect(
    "flushes waitUntil work scheduled from inside the worker",
    Effect.fn(function* () {
      yield* fetchJson("/wait-until", { method: "POST" })

      const w = yield* W.Miniflare
      yield* w.waitWaitUntil()

      const json = yield* fetchJson("/wait-until-result")

      expect(json).toEqual({
        result: "done"
      })
    })
  )
})
