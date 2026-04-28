import * as W from "../src/testing/workers.ts"
import * as Test from "@effect-x/server-testing/workers"
import { NodeContext } from "@effect/platform-node"
import { expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { basename, resolve } from "node:path"

const TestLive = W.workers({
  persist: basename(import.meta.url),
  cwd: resolve(import.meta.dirname, "fixtures/queue-control-worker"),
  tsconfig: resolve(import.meta.dirname, "../tsconfig.json"),
  env: {
    NAME: "queue-control-worker",
    NAMESPACE: "cloudflare-queue-control-e2e"
  }
}).pipe(Layer.provideMerge(NodeContext.layer))

const fetchJson = Effect.fn("fetchJson")(function* (path: string, init?: RequestInit | undefined) {
  const w = yield* W.Miniflare
  const response = yield* w.fetch(`http://localhost${path}`, init)
  expect(response.status).toBe(200)
  return yield* Effect.promise(() => response.json() as Promise<any>)
})

const waitForQueueResults = Effect.gen(function* () {
  for (let attempt = 0; attempt < 20; attempt++) {
    const json = yield* fetchJson("/queue-control-results")

    if (json.attempts === "2" && json.finalMessageId) {
      return json
    }

    yield* Effect.promise(() => new Promise((resolveQueuePoll) => setTimeout(resolveQueuePoll, 100)))
  }

  return yield* Effect.dieMessage("queue control results were not written by the worker consumer")
})

Test.test(TestLive)("Cloudflare queue control workers", (it) => {
  it.effect(
    "runs send, messages, retryAll, and ackAll against the real queue runtime",
    Effect.fn(function* () {
      yield* fetchJson("/enqueue-single", { method: "POST" })

      const w = yield* W.Miniflare
      yield* w.waitWaitUntil()

      const json = yield* waitForQueueResults

      expect(json.attempts).toBe("2")
      expect(json.batchSize).toBe("1")
      expect(json.receivedValue).toBe("queue:single")
      expect(typeof json.firstMessageId).toBe("string")
      expect(json.firstMessageId).toBe(json.finalMessageId)
    })
  )
})
