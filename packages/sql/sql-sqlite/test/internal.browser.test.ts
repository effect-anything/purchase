import { assert, describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit } from "effect"
import { identity } from "effect/Function"

import { createBroadcastChannel } from "../src/internal/broadcast-channel.ts"
import { SqliteImportExecute, SqliteStorageSize, type WorkerError } from "../src/schema.ts"

describe("internal browser primitives", () => {
  it.scoped("uses the real BroadcastChannel implementation to route requests between peers", () =>
    Effect.gen(function* () {
      const name = `sqlite-browser-${crypto.randomUUID().slice(0, 4)}`
      const client = yield* createBroadcastChannel(name, identity)
      const server = yield* createBroadcastChannel(name, identity)
      yield* Effect.addFinalizer(() => Effect.all([client.close, server.close], { discard: true }))

      server.handle(SqliteStorageSize, () => Effect.succeed(42))

      const result = yield* client.send(new SqliteStorageSize())
      const voidResult = yield* Effect.exit(
        client.send(
          new SqliteImportExecute(
            {
              data: new Uint8Array([1, 2, 3])
            },
            { disableValidation: true }
          )
        )
      )

      expect(result).toBe(42)
      assert(Exit.isFailure(voidResult))
      assert(Cause.isFailType(voidResult.cause))
      const error = voidResult.cause.error as WorkerError
      expect(error._tag).toBe("WorkerError")
      expect((error.cause as Error).message).toContain("has no handler for SqliteImportExecute")
    })
  )
})
