import * as W from "../src/testing/workers.ts"
import * as Test from "@effect-x/server-testing/workers"
import { NodeContext } from "@effect/platform-node"
import { expect } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { basename, resolve } from "node:path"

const TestLive = W.workers({
  persist: basename(import.meta.url),
  cwd: resolve(import.meta.dirname, "fixtures/workflow-worker"),
  tsconfig: resolve(import.meta.dirname, "../tsconfig.json"),
  env: {
    NAME: "workflow-worker",
    NAMESPACE: "cloudflare-workflow-e2e"
  }
}).pipe(Layer.provideMerge(NodeContext.layer))

const fetchJson = (path: string, init?: RequestInit | undefined) =>
  Effect.gen(function* () {
    const w = yield* W.Miniflare
    const response = yield* w.fetch(`http://localhost${path}`, init)

    expect(response.status).toBe(200)
    return yield* Effect.promise(() => response.json() as Promise<any>)
  })

Test.test(TestLive)("Cloudflare workflow workers", (it) => {
  it.effect(
    "runs create/get and workflow steps against a real workflow binding",
    Effect.fn(function* () {
      const id = `workflow-single-${crypto.randomUUID()}`
      const created = yield* fetchJson(`/workflow/create?id=${id}&name=single&value=2`, { method: "POST" })

      expect(created).toEqual({
        id
      })

      const instance = yield* W.Miniflare.pipe(Effect.flatMap((w) => w.workflows.get("MIRROR_WORKFLOW", id)))
      const doubled = yield* instance.waitForStepResult("double", 0)
      const tripled = yield* instance.waitForStepResult("triple", 1)
      const final = yield* instance.waitForStepResult("final", 2)

      expect(doubled).toBe(4)
      expect(tripled).toBe(6)
      expect(final).toEqual({
        name: "single",
        doubled: 4
      })

      yield* instance.waitForStatus("complete")

      const fetched = yield* fetchJson(`/workflow/get?id=${id}`)

      expect(fetched).toEqual({
        exists: true,
        id
      })
    })
  )

  it.effect(
    "runs createBatch against the real workflow proxy and completes every instance",
    Effect.fn(function* () {
      const prefix = `workflow-batch-${crypto.randomUUID()}`
      const idA = `${prefix}-a`
      const idB = `${prefix}-b`
      const created = yield* fetchJson(`/workflow/create-batch?prefix=${prefix}`, { method: "POST" })

      expect(created).toEqual({
        ids: [idA, idB]
      })

      const w = yield* W.Miniflare
      const batchA = yield* w.workflows.get("MIRROR_WORKFLOW", idA)
      const batchB = yield* w.workflows.get("MIRROR_WORKFLOW", idB)

      yield* Effect.all([batchA.waitForStatus("complete"), batchB.waitForStatus("complete")], {
        concurrency: "unbounded"
      })

      const doubleA = yield* batchA.waitForStepResult("double", 0)
      const finalA = yield* batchA.waitForStepResult("final", 2)
      const doubleB = yield* batchB.waitForStepResult("double", 0)
      const finalB = yield* batchB.waitForStepResult("final", 2)

      expect(doubleA).toBe(2)
      expect(finalA).toEqual({ name: "batch-a", doubled: 2 })
      expect(doubleB).toBe(6)
      expect(finalB).toEqual({ name: "batch-b", doubled: 6 })
    })
  )
})
