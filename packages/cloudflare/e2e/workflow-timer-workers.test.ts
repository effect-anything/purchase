import * as W from "../src/testing/workers.ts"
import * as Test from "@effect-x/server-testing/workers"
import { NodeContext } from "@effect/platform-node"
import { expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { basename, resolve } from "node:path"

const TestLive = W.workers({
  persist: basename(import.meta.url),
  cwd: resolve(import.meta.dirname, "fixtures/workflow-timer-worker"),
  tsconfig: resolve(import.meta.dirname, "../tsconfig.json"),
  env: {
    NAME: "workflow-timer-worker",
    NAMESPACE: "cloudflare-workflow-timer-e2e"
  }
}).pipe(Layer.provideMerge(NodeContext.layer))

const fetchJson = (path: string, init?: RequestInit | undefined) =>
  Effect.gen(function* () {
    const w = yield* W.Miniflare
    const response = yield* w.fetch(`http://localhost${path}`, init)

    expect(response.status).toBe(200)
    return yield* Effect.promise(() => response.json() as Promise<any>)
  })

Test.test(TestLive)("Cloudflare workflow timer workers", (it) => {
  it.effect(
    "runs sleep and sleepUntil before persisting results with real bindings",
    Effect.fn(function* () {
      const id = `workflow-timer-${crypto.randomUUID()}`
      const wakeAt = Date.now() + 150
      const startedAt = Date.now()

      const created = yield* fetchJson(`/workflow/create?id=${id}&value=9&wakeAt=${wakeAt}`, { method: "POST" })
      expect(created).toEqual({
        id
      })

      const instance = yield* W.Miniflare.pipe(Effect.flatMap((w) => w.workflows.get("TIMER_WORKFLOW", id)))
      yield* instance.waitForStatus("complete")
      const elapsed = Date.now() - startedAt
      expect(elapsed).toBeGreaterThanOrEqual(100)

      const result = yield* fetchJson(`/workflow/result?id=${id}`)
      expect(result).toEqual({
        exists: true,
        value: {
          value: 9,
          wokeUp: true
        }
      })
    })
  )
})
