import * as W from "../src/testing/workers.ts"
import * as Test from "@effect-x/server-testing/workers"
import { NodeContext } from "@effect/platform-node"
import { expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { basename, resolve } from "node:path"

const TestLive = W.workers({
  persist: basename(import.meta.url),
  cwd: resolve(import.meta.dirname, "fixtures/queue-worker"),
  tsconfig: resolve(import.meta.dirname, "../tsconfig.json"),
  env: {
    NAME: "queue-worker",
    NAMESPACE: "cloudflare-queue-e2e"
  }
}).pipe(Layer.provideMerge(NodeContext.layer))

const fetchJson = (path: string, init?: RequestInit | undefined) =>
  Effect.gen(function* () {
    const w = yield* W.Miniflare
    const response = yield* w.fetch(`http://localhost${path}`, init)

    expect(response.status).toBe(200)
    return yield* Effect.promise(() => response.json() as Promise<any>)
  })

const waitForQueueResults = Effect.gen(function* () {
  for (let attempt = 0; attempt < 20; attempt++) {
    const json = yield* fetchJson("/queue-results")

    if (json.processed === "queue:ok") {
      return json
    }

    yield* Effect.promise(() => new Promise((resolveQueuePoll) => setTimeout(resolveQueuePoll, 100)))
  }

  return yield* Effect.dieMessage("queue results were not written by the worker consumer")
})

Test.test(TestLive)("Cloudflare queue workers", (it) => {
  it.effect(
    "delivers queue messages to the real worker consumer and persists combined results",
    Effect.fn(function* () {
      yield* fetchJson("/enqueue", { method: "POST" })

      const w = yield* W.Miniflare
      yield* w.waitWaitUntil()

      const json = yield* waitForQueueResults

      expect(json).toEqual({
        successes: '["ok"]',
        failures: '["retry","invalid"]',
        processed: "queue:ok",
        objectText: "queue:ok"
      })
    })
  )
})
