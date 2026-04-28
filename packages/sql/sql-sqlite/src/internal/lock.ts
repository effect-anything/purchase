import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"

const hasWebLocks = () =>
  typeof navigator !== "undefined" &&
  typeof navigator.locks !== "undefined" &&
  typeof navigator.locks.request === "function"

const hasBroadcastChannel = () => typeof BroadcastChannel !== "undefined"

const canUseSyntheticLock = () => {
  const target = globalThis as typeof globalThis & {
    isDesktop?: boolean
  }

  return (typeof navigator === "undefined" || target.isDesktop === true) && hasBroadcastChannel()
}

const makeSyntheticLock = (lockName: string) =>
  ({
    name: lockName,
    mode: "exclusive"
  }) as Lock

const makeLockError = (operation: "acquire" | "wait", lockName: string, cause: unknown) =>
  new Error(`Failed to ${operation} sqlite lock "${lockName}"`, {
    cause: cause instanceof Error ? cause : new Error(String(cause))
  })

const makeMissingWebLocksError = (operation: "acquire" | "wait", lockName: string) =>
  new Error(`Cannot ${operation} sqlite lock "${lockName}" without navigator.locks or BroadcastChannel coordination`)

const SYNTHETIC_LOCK_SETTLE_MS = 20
const SYNTHETIC_LOCK_RETRY_MS = 30
const SYNTHETIC_LOCK_ELECTION_ROUNDS = 3

type SyntheticLockMessage =
  | {
      readonly type: "probe"
      readonly contenderId: string
    }
  | {
      readonly type: "candidate"
      readonly contenderId: string
    }
  | {
      readonly type: "owner"
      readonly ownerId: string
    }
  | {
      readonly type: "released"
      readonly ownerId: string
    }

const makeSyntheticChannelName = (lockName: string) => `@effect-x/sql-sqlite/lock/${lockName}`

const makeSyntheticId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

const makeSyntheticLockEffect = (
  deferred: Deferred.Deferred<void>,
  lockName: string,
  operation: "acquire" | "wait",
  mode: "ifAvailable" | "wait"
) =>
  Effect.async<Lock | undefined, Error>((resume, signal) => {
    if (!canUseSyntheticLock()) {
      resume(Effect.fail(makeMissingWebLocksError(operation, lockName)))
      return
    }

    const channel = new BroadcastChannel(makeSyntheticChannelName(lockName))
    const contenderId = makeSyntheticId()
    let settled = false
    let closed = false
    let acquired = false
    let retryTimeout: ReturnType<typeof setTimeout> | undefined
    let settleTimeout: ReturnType<typeof setTimeout> | undefined
    let observedOwnerId: string | undefined
    let lowerPriorityContender = false
    let electionRound = 0

    const clearTimers = () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout)
        retryTimeout = undefined
      }
      if (settleTimeout) {
        clearTimeout(settleTimeout)
        settleTimeout = undefined
      }
    }

    const close = () => {
      if (closed) return
      closed = true
      clearTimers()
      channel.removeEventListener("message", onMessage)
      channel.close()
    }

    const settle = (effect: Effect.Effect<Lock | undefined, Error>) => {
      if (settled) return
      settled = true
      resume(effect)
    }

    const postMessage = (message: SyntheticLockMessage) => {
      try {
        channel.postMessage(message)
      } catch (cause) {
        settle(Effect.fail(makeLockError(operation, lockName, cause)))
        close()
      }
    }

    const release = () => {
      if (!acquired) {
        close()
        return
      }

      acquired = false
      postMessage({ type: "released", ownerId: contenderId })
      close()
    }

    const scheduleAttempt = (delayMs: number) => {
      if (closed || acquired || settled) return
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      retryTimeout = setTimeout(() => {
        observedOwnerId = undefined
        lowerPriorityContender = false
        electionRound = 0
        attemptAcquire()
      }, delayMs)
    }

    const attemptAcquire = () => {
      if (closed || acquired) return

      electionRound += 1

      postMessage({ type: "probe", contenderId })
      postMessage({ type: "candidate", contenderId })

      settleTimeout = setTimeout(() => {
        if (closed || acquired) return

        if (observedOwnerId !== undefined || lowerPriorityContender) {
          if (mode === "ifAvailable") {
            settle(Effect.succeed(undefined))
            close()
            return
          }

          scheduleAttempt(SYNTHETIC_LOCK_RETRY_MS)
          return
        }

        if (electionRound < SYNTHETIC_LOCK_ELECTION_ROUNDS) {
          attemptAcquire()
          return
        }

        acquired = true
        postMessage({ type: "owner", ownerId: contenderId })
        settle(Effect.succeed(makeSyntheticLock(lockName)))

        void Effect.runPromise(Deferred.await(deferred)).finally(release)
      }, SYNTHETIC_LOCK_SETTLE_MS)
    }

    const onMessage = (event: MessageEvent<unknown>) => {
      const data = event.data
      if (!data || typeof data !== "object" || !("type" in data)) {
        return
      }

      const message = data as SyntheticLockMessage

      switch (message.type) {
        case "probe":
          if (acquired && message.contenderId !== contenderId) {
            postMessage({ type: "owner", ownerId: contenderId })
          }
          return
        case "candidate":
          if (message.contenderId === contenderId) return
          if (acquired) {
            postMessage({ type: "owner", ownerId: contenderId })
            return
          }
          if (message.contenderId < contenderId) {
            lowerPriorityContender = true
          }
          return
        case "owner":
          if (message.ownerId !== contenderId) {
            observedOwnerId = message.ownerId
          }
          return
        case "released":
          if (mode === "wait" && observedOwnerId === message.ownerId) {
            observedOwnerId = undefined
            scheduleAttempt(0)
          }
          return
      }
    }

    channel.addEventListener("message", onMessage)

    if (signal.aborted) {
      close()
      return
    }

    signal.addEventListener("abort", close, { once: true })
    attemptAcquire()

    return Effect.sync(() => {
      signal.removeEventListener("abort", close)
      close()
    })
  })

export const getForDeferredLock = (deferred: Deferred.Deferred<void>, lockName: string) =>
  Effect.async<Lock | undefined, Error>((resume) => {
    if (!hasWebLocks()) {
      resume(
        canUseSyntheticLock()
          ? makeSyntheticLockEffect(deferred, lockName, "acquire", "ifAvailable")
          : Effect.fail(makeMissingWebLocksError("acquire", lockName))
      )
      return
    }

    let settled = false
    const settle = (effect: Effect.Effect<Lock | undefined, Error>) => {
      if (settled) return
      settled = true
      resume(effect)
    }

    navigator.locks
      .request(lockName, { mode: "exclusive", ifAvailable: true }, async (_lock) => {
        settle(Effect.succeed(_lock ?? undefined))

        if (_lock) {
          await Effect.runPromise(Deferred.await(deferred))
        }
      })
      .catch((cause) => {
        if (cause instanceof Error && cause.name === "AbortError") {
          return
        }

        settle(Effect.fail(makeLockError("acquire", lockName, cause)))
      })
  })

export const waitForDeferredLock = (deferred: Deferred.Deferred<void>, lockName: string) =>
  Effect.async<Lock | undefined, Error>((resume, signal) => {
    if (!hasWebLocks()) {
      resume(
        canUseSyntheticLock()
          ? makeSyntheticLockEffect(deferred, lockName, "wait", "wait")
          : Effect.fail(makeMissingWebLocksError("wait", lockName))
      )
      return
    }

    let settled = false
    const settle = (effect: Effect.Effect<Lock | undefined, Error>) => {
      if (settled) return
      settled = true
      resume(effect)
    }

    navigator.locks
      .request(lockName, { signal, mode: "exclusive", ifAvailable: false }, async (_lock) => {
        settle(Effect.succeed(_lock ?? undefined))

        await Effect.runPromise(Deferred.await(deferred))
      })
      .catch((cause) => {
        if (cause instanceof Error && cause.name === "AbortError") {
          return
        }

        settle(Effect.fail(makeLockError("wait", lockName, cause)))
      })
  })
