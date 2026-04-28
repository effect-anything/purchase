import { assert, describe, expect, it } from "@effect/vitest"
import { Cause, Deferred, Effect, Exit, Fiber } from "effect"

import { getForDeferredLock, waitForDeferredLock } from "../src/internal/lock.ts"

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

  removeEventListener(type: string, listener: MessageListener) {
    if (type === "message") {
      this.listeners.delete(listener)
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

class DelayedBroadcastChannel extends FakeBroadcastChannel {
  override postMessage(data: unknown) {
    for (const channel of FakeBroadcastChannel.registry.get(this.name) ?? []) {
      if (channel === this) continue

      setTimeout(() => {
        for (const listener of channel.listeners) {
          listener({ data })
        }
      }, 35)
    }
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

describe("internal lock", () => {
  it.effect("coordinates desktop lock ownership through BroadcastChannel when Web Locks are unavailable", () =>
    Effect.gen(function* () {
      const restoreDesktop = withGlobal("isDesktop", true)
      const restoreNavigator = withGlobal("navigator", undefined)
      const restoreBroadcastChannel = withGlobal("BroadcastChannel", FakeBroadcastChannel)

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restoreBroadcastChannel()
          restoreNavigator()
          restoreDesktop()
        })
      )

      const ownerDeferred = yield* Deferred.make<void>()
      const waiterDeferred = yield* Deferred.make<void>()

      const ownerLock = yield* getForDeferredLock(ownerDeferred, "sqlite-db")
      const contenderLock = yield* getForDeferredLock(waiterDeferred, "sqlite-db")

      const waitFiber = yield* Effect.fork(waitForDeferredLock(waiterDeferred, "sqlite-db"))
      yield* Effect.yieldNow()

      const beforeRelease = yield* Fiber.poll(waitFiber)

      expect(ownerLock).toEqual({
        name: "sqlite-db",
        mode: "exclusive"
      })
      expect(contenderLock).toBeUndefined()
      expect(beforeRelease._tag).toBe("None")

      yield* Deferred.succeed(ownerDeferred, undefined)
      const waiterLock = yield* Fiber.join(waitFiber)

      expect(waiterLock).toEqual({
        name: "sqlite-db",
        mode: "exclusive"
      })

      yield* Deferred.succeed(waiterDeferred, undefined)
    }).pipe(Effect.scoped)
  )

  it.effect("fails in web runtimes when navigator.locks is unavailable", () =>
    Effect.gen(function* () {
      const restoreDesktop = withGlobal("isDesktop", false)
      const restoreNavigator = withGlobal("navigator", {})
      const restoreBroadcastChannel = withGlobal("BroadcastChannel", undefined)

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          restoreBroadcastChannel()
          restoreNavigator()
          restoreDesktop()
        })
      )

      const deferred = yield* Deferred.make<void>()
      const exit = yield* Effect.exit(getForDeferredLock(deferred, "sqlite-db"))

      assert(Exit.isFailure(exit))
      assert(Cause.isFailType(exit.cause))
      expect(exit.cause.error.message).toContain("without navigator.locks or BroadcastChannel coordination")
    }).pipe(Effect.scoped)
  )

  it.effect("fails safely on desktop when no lock coordination primitive is available", () =>
    Effect.gen(function* () {
      const restoreDesktop = withGlobal("isDesktop", true)
      const restoreNavigator = withGlobal("navigator", undefined)
      const restoreBroadcastChannel = withGlobal("BroadcastChannel", undefined)

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          restoreBroadcastChannel()
          restoreNavigator()
          restoreDesktop()
        })
      )

      const deferred = yield* Deferred.make<void>()
      const exit = yield* Effect.exit(getForDeferredLock(deferred, "sqlite-db"))

      assert(Exit.isFailure(exit))
      assert(Cause.isFailType(exit.cause))
      expect(exit.cause.error.message).toContain("without navigator.locks or BroadcastChannel coordination")
    }).pipe(Effect.scoped)
  )

  it.effect("prefers navigator locks even on desktop when the API is available", () =>
    Effect.gen(function* () {
      const requestCalls: Array<unknown> = []
      const restoreDesktop = withGlobal("isDesktop", true)
      const restoreNavigator = withGlobal("navigator", {
        locks: {
          request: (name: string, options: Record<string, unknown>, callback: (lock: Lock | null) => Promise<void>) => {
            requestCalls.push({ name, options })
            return Promise.resolve(callback({ name, mode: "exclusive" } as Lock))
          }
        }
      })

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          restoreNavigator()
          restoreDesktop()
        })
      )

      const deferred = yield* Deferred.make<void>()
      const lock = yield* getForDeferredLock(deferred, "sqlite-db")

      expect(lock).toEqual({
        name: "sqlite-db",
        mode: "exclusive"
      })
      expect(requestCalls).toEqual([
        {
          name: "sqlite-db",
          options: {
            mode: "exclusive",
            ifAvailable: true
          }
        }
      ])
    }).pipe(Effect.scoped)
  )

  it.effect("requires multiple quiet election rounds before synthetic ownership is granted", () =>
    Effect.gen(function* () {
      const restoreDesktop = withGlobal("isDesktop", true)
      const restoreNavigator = withGlobal("navigator", undefined)
      const restoreBroadcastChannel = withGlobal("BroadcastChannel", DelayedBroadcastChannel)

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          FakeBroadcastChannel.reset()
          restoreBroadcastChannel()
          restoreNavigator()
          restoreDesktop()
        })
      )

      const leftDeferred = yield* Deferred.make<void>()
      const rightDeferred = yield* Deferred.make<void>()

      const [leftLock, rightLock] = yield* Effect.all(
        [getForDeferredLock(leftDeferred, "sqlite-db"), getForDeferredLock(rightDeferred, "sqlite-db")],
        {
          concurrency: "unbounded"
        }
      )

      expect([leftLock, rightLock].filter((lock) => lock !== undefined)).toHaveLength(1)

      yield* Effect.forEach([leftDeferred, rightDeferred], (deferred) => Deferred.done(deferred, Exit.void), {
        discard: true
      })
    }).pipe(Effect.scoped)
  )

  it.effect("requests an available browser lock and keeps the callback open until the deferred resolves", () =>
    Effect.gen(function* () {
      const requestCalls: Array<unknown> = []
      let released = false
      let requestPromise: Promise<unknown> | undefined

      const restoreDesktop = withGlobal("isDesktop", false)
      const restoreNavigator = withGlobal("navigator", {
        locks: {
          request: (name: string, options: Record<string, unknown>, callback: (lock: Lock | null) => Promise<void>) => {
            requestCalls.push({ name, options })
            requestPromise = Promise.resolve(callback({ name, mode: "exclusive" } as Lock)).then(() => {
              released = true
            })
            return requestPromise
          }
        }
      })

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          restoreNavigator()
          restoreDesktop()
        })
      )

      const deferred = yield* Deferred.make<void>()
      const lock = yield* getForDeferredLock(deferred, "sqlite-db")

      expect(lock).toEqual({
        name: "sqlite-db",
        mode: "exclusive"
      })
      expect(requestCalls).toEqual([
        {
          name: "sqlite-db",
          options: {
            mode: "exclusive",
            ifAvailable: true
          }
        }
      ])
      expect(released).toBe(false)

      yield* Deferred.succeed(deferred, undefined)
      yield* Effect.promise(() => requestPromise as Promise<unknown>)

      expect(released).toBe(true)
    }).pipe(Effect.scoped)
  )

  it.effect("waits for a blocking browser lock with an abort signal", () =>
    Effect.gen(function* () {
      const requestCalls: Array<{
        name: string
        options: {
          mode: string
          ifAvailable: boolean
          signal: AbortSignal
        }
      }> = []
      let requestPromise: Promise<unknown> | undefined

      const restoreDesktop = withGlobal("isDesktop", false)
      const restoreNavigator = withGlobal("navigator", {
        locks: {
          request: (
            name: string,
            options: {
              mode: string
              ifAvailable: boolean
              signal: AbortSignal
            },
            callback: (lock: Lock | null) => Promise<void>
          ) => {
            requestCalls.push({ name, options })
            requestPromise = Promise.resolve(callback({ name, mode: "exclusive" } as Lock))
            return requestPromise
          }
        }
      })

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          restoreNavigator()
          restoreDesktop()
        })
      )

      const deferred = yield* Deferred.make<void>()
      const lock = yield* waitForDeferredLock(deferred, "sqlite-db")

      expect(lock).toEqual({
        name: "sqlite-db",
        mode: "exclusive"
      })
      expect(requestCalls).toHaveLength(1)
      expect(requestCalls[0]?.name).toBe("sqlite-db")
      expect(requestCalls[0]?.options.mode).toBe("exclusive")
      expect(requestCalls[0]?.options.ifAvailable).toBe(false)
      expect(requestCalls[0]?.options.signal).toBeInstanceOf(AbortSignal)

      yield* Deferred.succeed(deferred, undefined)
      yield* Effect.promise(() => requestPromise as Promise<unknown>)
    }).pipe(Effect.scoped)
  )

  it.effect("surfaces non-abort lock failures", () =>
    Effect.gen(function* () {
      const restoreDesktop = withGlobal("isDesktop", false)
      const restoreNavigator = withGlobal("navigator", {
        locks: {
          request: () => Promise.reject(new Error("lock manager offline"))
        }
      })

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          restoreNavigator()
          restoreDesktop()
        })
      )

      const deferred = yield* Deferred.make<void>()
      const exit = yield* Effect.exit(getForDeferredLock(deferred, "sqlite-db"))

      assert(Exit.isFailure(exit))
      assert(Cause.isFailType(exit.cause))
      expect(exit.cause.error).toBeInstanceOf(Error)
      expect(exit.cause.error.message).toContain('Failed to acquire sqlite lock "sqlite-db"')
    }).pipe(Effect.scoped)
  )
})
