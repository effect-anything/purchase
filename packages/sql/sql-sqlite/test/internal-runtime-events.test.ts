import * as SqliteSchema from "@effect-x/sql-sqlite/schema"
import { describe, expect, it } from "@effect/vitest"
import { Context, Effect, Exit, Fiber, Layer, Scope, Stream } from "effect"

import { SqliteRuntimeEvents } from "../src/internal/runtime-events.ts"

describe("sqlite runtime events", () => {
  it.effect("keeps runtime event streams isolated per layer scope", () =>
    Effect.gen(function* () {
      const parentScope = yield* Effect.scope
      const leftScope = yield* Scope.fork(parentScope, parentScope.strategy)
      const rightScope = yield* Scope.fork(parentScope, parentScope.strategy)

      const leftContext = yield* Layer.buildWithScope(SqliteRuntimeEvents.Live, leftScope)
      const rightContext = yield* Layer.buildWithScope(SqliteRuntimeEvents.Live, rightScope)

      const leftRuntimeEvents = Context.get(leftContext, SqliteRuntimeEvents)
      const rightRuntimeEvents = Context.get(rightContext, SqliteRuntimeEvents)

      const leftEvent = new SqliteSchema.SqliteLockChangeHookEvent({ lockAcquire: true })
      const rightEvent = new SqliteSchema.SqliteLockChangeHookEvent({ lockAcquire: false })

      const leftFiber = yield* Effect.fork(Stream.runCollect(leftRuntimeEvents.stream.pipe(Stream.take(1))))
      const rightFiber = yield* Effect.fork(Stream.runCollect(rightRuntimeEvents.stream.pipe(Stream.take(1))))

      yield* leftRuntimeEvents.publish(leftEvent)

      expect(Array.from(yield* Fiber.join(leftFiber))).toEqual([leftEvent])

      yield* Effect.yieldNow()
      const rightBeforeLeftClose = yield* Fiber.poll(rightFiber)
      expect(rightBeforeLeftClose._tag).toBe("None")

      yield* Scope.close(leftScope, Exit.void)
      yield* rightRuntimeEvents.publish(rightEvent)

      expect(Array.from(yield* Fiber.join(rightFiber))).toEqual([rightEvent])
    }).pipe(Effect.scoped)
  )
})
