import * as W from "../src/testing/workers.ts"
import * as Test from "@effect-x/server-testing/workers"
import { NodeContext } from "@effect/platform-node"
import { expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { basename, resolve } from "node:path"

const TestLive = W.workers({
  persist: basename(import.meta.url),
  cwd: resolve(import.meta.dirname, "fixtures/scheduled-worker"),
  tsconfig: resolve(import.meta.dirname, "../tsconfig.json"),
  env: {
    NAME: "scheduled-worker",
    NAMESPACE: "cloudflare-scheduled-e2e"
  }
}).pipe(Layer.provideMerge(NodeContext.layer))

const fetchJson = (path: string, init?: RequestInit | undefined) =>
  Effect.gen(function* () {
    const w = yield* W.Miniflare
    const response = yield* w.fetch(`http://localhost${path}`, init)

    expect(response.status).toBe(200)
    return yield* Effect.promise(() => response.json() as Promise<any>)
  })

Test.test(TestLive)("Cloudflare scheduled workers", (it) => {
  it.effect(
    "dispatches the real scheduled handler and persists cron context through worker services",
    Effect.fn(function* () {
      const w = yield* W.Miniflare
      const scheduledTime = Date.UTC(2026, 2, 28, 16, 0, 0)
      const baseUrl = yield* w.url
      const response = yield* Effect.promise(() =>
        fetch(
          new URL(`/cdn-cgi/handler/scheduled?cron=${encodeURIComponent("0 * * * *")}&time=${scheduledTime}`, baseUrl)
        )
      )

      expect(response.status).toBe(200)
      expect(yield* Effect.promise(() => response.text())).toBe("ok")

      yield* w.waitWaitUntil()

      const json = yield* fetchJson("/scheduled-result")

      expect(json).toEqual({
        cron: "0 * * * *",
        scheduledTime: "2026-03-28T16:00:00.000Z",
        noRetry: "called",
        waitUntil: "done"
      })
    })
  )
})
