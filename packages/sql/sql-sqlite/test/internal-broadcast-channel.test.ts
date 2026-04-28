import { assert, describe, expect, it } from "@effect/vitest"
import { Cause, Deferred, Effect, Exit, Fiber } from "effect"
import { identity } from "effect/Function"

import { createBroadcastChannel } from "../src/internal/broadcast-channel.ts"
import { SqlError, SqliteImportExecute, SqliteQueryExecute, SqliteStorageSize, WorkerError } from "../src/schema.ts"

type MessageListener = (event: { data: unknown }) => void

class FakeBroadcastChannel {
  static readonly registry = new Map<string, Set<FakeBroadcastChannel>>()

  readonly listeners = new Set<MessageListener>()
  readonly name: string

  constructor(name: string) {
    this.name = name

    const channels = FakeBroadcastChannel.registry.get(name) ?? new Set<FakeBroadcastChannel>()
    channels.add(this)
    FakeBroadcastChannel.registry.set(name, channels)
  }

  postMessage(data: unknown) {
    for (const channel of FakeBroadcastChannel.registry.get(this.name) ?? []) {
      if (channel === this) continue

      queueMicrotask(() => {
        for (const listener of channel.listeners) {
          listener({ data })
        }
      })
    }
  }

  addEventListener(type: string, listener: MessageListener) {
    if (type === "message") {
      this.listeners.add(listener)
    }
  }

  close() {
    const channels = FakeBroadcastChannel.registry.get(this.name)
    if (!channels) return

    channels.delete(this)
    if (channels.size === 0) {
      FakeBroadcastChannel.registry.delete(this.name)
    }
  }

  static reset() {
    FakeBroadcastChannel.registry.clear()
  }
}

class ThrowingBroadcastChannel extends FakeBroadcastChannel {
  override postMessage(_data: unknown) {
    throw new Error("channel closed")
  }
}

const withGlobal = (key: string, value: unknown) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, key)

  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value
  })

  return () => {
    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor)
    } else {
      delete (globalThis as Record<string, unknown>)[key]
    }
  }
}

describe("internal broadcast channel", () => {
  it.effect("routes requests between peers and preserves success and failure payloads", () =>
    Effect.gen(function* () {
      const restore = withGlobal("BroadcastChannel", FakeBroadcastChannel)
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restore()
        })
      )

      const client = yield* createBroadcastChannel("sqlite-tests", identity)
      const server = yield* createBroadcastChannel("sqlite-tests", identity)
      yield* Effect.addFinalizer(() => Effect.all([client.close, server.close], { discard: true }))

      server.handle(SqliteStorageSize, () => Effect.succeed(42))
      server.handle(SqliteQueryExecute, () => Effect.fail(new SqlError({ message: "query boom" })))

      const size = yield* client.send(new SqliteStorageSize())
      const failedQuery = yield* Effect.exit(
        client.send(
          new SqliteQueryExecute(
            {
              sql: "SELECT 1",
              params: [],
              rowMode: "object"
            },
            { disableValidation: true }
          )
        )
      )

      expect(size).toBe(42)
      assert(Exit.isFailure(failedQuery))
      assert(Cause.isFailType(failedQuery.cause))
      expect(failedQuery.cause.error).toEqual(new SqlError({ message: "query boom" }))
    }).pipe(Effect.scoped)
  )

  it.effect("fails when no peer handler is registered", () =>
    Effect.gen(function* () {
      const restore = withGlobal("BroadcastChannel", FakeBroadcastChannel)
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restore()
        })
      )

      const client = yield* createBroadcastChannel("sqlite-tests", identity)
      const peer = yield* createBroadcastChannel("sqlite-tests", identity)
      yield* Effect.addFinalizer(() => Effect.all([client.close, peer.close], { discard: true }))

      const result = yield* Effect.exit(
        client.send(
          new SqliteImportExecute(
            {
              data: new Uint8Array([1, 2, 3])
            },
            { disableValidation: true }
          )
        )
      )

      assert(Exit.isFailure(result))
      assert(Cause.isFailType(result.cause))
      const error = result.cause.error as WorkerError
      expect(error._tag).toBe("WorkerError")
      expect(error.reason).toBe("unknown")
      expect((error.cause as Error).message).toContain("has no handler for SqliteImportExecute")
    }).pipe(Effect.scoped)
  )

  it.effect("can ignore unhandled peers so only the runtime owner answers shared requests", () =>
    Effect.gen(function* () {
      const restore = withGlobal("BroadcastChannel", FakeBroadcastChannel)
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restore()
        })
      )

      const client = yield* createBroadcastChannel("sqlite-tests", identity)
      const follower = yield* createBroadcastChannel("sqlite-tests", identity)
      const main = yield* createBroadcastChannel("sqlite-tests", identity)
      yield* Effect.addFinalizer(() => Effect.all([client.close, follower.close, main.close], { discard: true }))

      main.handle(SqliteStorageSize, () => Effect.succeed(42))

      const size = yield* client.send(new SqliteStorageSize(), {
        discard: false,
        ignoreUnhandled: true
      })

      expect(size).toBe(42)
    }).pipe(Effect.scoped)
  )

  it.effect("times out ignored requests when no runtime owner answers", () =>
    Effect.gen(function* () {
      const restore = withGlobal("BroadcastChannel", FakeBroadcastChannel)
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restore()
        })
      )

      const client = yield* createBroadcastChannel("sqlite-tests", identity)
      const follower = yield* createBroadcastChannel("sqlite-tests", identity)
      yield* Effect.addFinalizer(() => Effect.all([client.close, follower.close], { discard: true }))

      const result = yield* Effect.exit(
        client.send(new SqliteStorageSize(), {
          discard: false,
          ignoreUnhandled: true,
          timeoutMs: 10
        })
      )

      assert(Exit.isFailure(result))
      assert(Cause.isFailType(result.cause))
      const error = result.cause.error as WorkerError
      expect(error._tag).toBe("WorkerError")
      expect(error.reason).toBe("unknown")
      expect((error.cause as Error).message).toContain("timed out waiting for SqliteStorageSize")
    }).pipe(Effect.scoped)
  )

  it.effect("defers request handling until `whenOpen` allows execution", () =>
    Effect.gen(function* () {
      const restore = withGlobal("BroadcastChannel", FakeBroadcastChannel)
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restore()
        })
      )

      const gate = yield* Deferred.make<void>()
      const client = yield* createBroadcastChannel("sqlite-tests", identity)
      const server = yield* createBroadcastChannel("sqlite-tests", (effect) =>
        Deferred.await(gate).pipe(Effect.zipRight(effect))
      )
      yield* Effect.addFinalizer(() => Effect.all([client.close, server.close], { discard: true }))

      server.handle(SqliteStorageSize, () => Effect.succeed(7))

      const fiber = yield* Effect.fork(client.send(new SqliteStorageSize()))
      const beforeOpen = yield* Fiber.poll(fiber)

      yield* Deferred.succeed(gate, undefined)

      const result = yield* fiber

      expect(beforeOpen._tag).toBe("None")
      expect(result).toBe(7)
    }).pipe(Effect.scoped)
  )

  it.effect("ignores malformed peer payloads and continues handling later requests", () =>
    Effect.gen(function* () {
      const restore = withGlobal("BroadcastChannel", FakeBroadcastChannel)
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restore()
        })
      )

      const client = yield* createBroadcastChannel("sqlite-tests", identity)
      const server = yield* createBroadcastChannel("sqlite-tests", identity)
      const rogue = new FakeBroadcastChannel("sqlite-tests")
      yield* Effect.addFinalizer(() => Effect.all([client.close, server.close], { discard: true }))
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          rogue.close()
        })
      )

      server.handle(SqliteStorageSize, () => Effect.succeed(9))

      //
      rogue.postMessage({ nope: true })
      yield* Effect.promise(() => new Promise((resolve) => setTimeout(resolve, 0)))

      const result = yield* client.send(new SqliteStorageSize())

      expect(result).toBe(9)
    }).pipe(Effect.scoped)
  )

  it.effect("fails immediately when the channel cannot post a request", () =>
    Effect.gen(function* () {
      const restore = withGlobal("BroadcastChannel", ThrowingBroadcastChannel)
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restore()
        })
      )

      const client = yield* createBroadcastChannel("sqlite-tests", identity)
      yield* Effect.addFinalizer(() => client.close)

      const result = yield* Effect.exit(client.send(new SqliteStorageSize()))

      assert(Exit.isFailure(result))
      assert(Cause.isFailType(result.cause))
      const error = result.cause.error as WorkerError

      expect(error._tag).toBe("WorkerError")
      expect(error.reason).toBe("send")
      expect(error.cause).toBeInstanceOf(Error)
      expect((error.cause as Error).message).toBe("channel closed")
    }).pipe(Effect.scoped)
  )

  it.effect("fails pending requests when the channel closes before any ack arrives", () =>
    Effect.gen(function* () {
      const restore = withGlobal("BroadcastChannel", FakeBroadcastChannel)
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restore()
        })
      )

      const client = yield* createBroadcastChannel("sqlite-tests", identity)
      yield* Effect.addFinalizer(() => client.close)

      const pending = Effect.fork(
        client.send(
          new SqliteQueryExecute(
            {
              sql: "SELECT 1",
              params: [],
              rowMode: "object"
            },
            { disableValidation: true }
          )
        )
      )

      const fiber = yield* pending
      yield* Effect.yieldNow()
      yield* client.close

      const result = yield* Fiber.await(fiber)

      assert(Exit.isFailure(result))
      assert(Cause.isFailType(result.cause))
      const error = result.cause.error as WorkerError
      expect(error).toBeInstanceOf(WorkerError)
      expect(error.reason).toBe("unknown")
      expect((error.cause as Error).message).toContain('broadcast channel "sqlite-tests" closed')
    }).pipe(Effect.scoped)
  )

  it.effect("keeps concurrent in-flight requests matched to the correct responses", () =>
    Effect.gen(function* () {
      const restore = withGlobal("BroadcastChannel", FakeBroadcastChannel)
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restore()
        })
      )

      const client = yield* createBroadcastChannel("sqlite-tests", identity)
      const server = yield* createBroadcastChannel("sqlite-tests", identity)
      yield* Effect.addFinalizer(() => Effect.all([client.close, server.close], { discard: true }))

      server.handle(SqliteQueryExecute, ({ sql }) =>
        Effect.promise(
          () =>
            new Promise<ReadonlyArray<{ sql: string }>>((resolve) => {
              setTimeout(() => resolve([{ sql }]), Math.floor(Math.random() * 5))
            })
        )
      )

      const requests = Array.from({ length: 16 }, (_, index) =>
        client.send(
          new SqliteQueryExecute(
            {
              sql: `SELECT ${index}`,
              params: [],
              rowMode: "object"
            },
            { disableValidation: true }
          )
        )
      )

      const results = yield* Effect.all(requests, { concurrency: "unbounded" })

      expect(results).toEqual(Array.from({ length: 16 }, (_, index) => [{ sql: `SELECT ${index}` }]))
    }).pipe(Effect.scoped)
  )
})
