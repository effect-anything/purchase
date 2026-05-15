import { Data, Effect } from "effect"
import { open, readFile, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

export class ProviderE2ELockError extends Data.TaggedError("ProviderE2ELockError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

export const acquireProviderE2ELock = (name: string, timeoutMs = 300_000) =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      const file = path.join(os.tmpdir(), `purchase-e2e-${sanitizeLockName(name)}.lock`)
      const startedAt = Date.now()

      while (Date.now() - startedAt < timeoutMs) {
        const handle = yield* Effect.tryPromise({
          try: () => open(file, "wx"),
          catch: (cause) =>
            new ProviderE2ELockError({ message: `Failed to acquire provider e2e lock "${name}"`, cause })
        }).pipe(Effect.either)

        if (handle._tag === "Right") {
          yield* Effect.promise(() =>
            handle.right.writeFile(
              JSON.stringify(
                {
                  name,
                  pid: process.pid,
                  acquiredAt: new Date().toISOString()
                },
                undefined,
                2
              )
            )
          )

          return { file, handle: handle.right }
        }

        yield* removeStaleLock(file)
        yield* Effect.sleep(1_000)
      }

      return yield* new ProviderE2ELockError({
        message: `Timed out waiting for provider e2e lock "${name}" after ${timeoutMs}ms`
      })
    }),
    ({ file, handle }) =>
      Effect.promise(async () => {
        await handle.close().catch(() => undefined)
        await rm(file, { force: true }).catch(() => undefined)
      })
  )

const sanitizeLockName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "-")

const removeStaleLock = (file: string) =>
  Effect.promise(async () => {
    const text = await readFile(file, "utf8").catch(() => undefined)
    if (!text) {
      return
    }

    const parsed = JSON.parse(text) as { readonly pid?: unknown }
    if (typeof parsed.pid !== "number") {
      return
    }

    if (isProcessAlive(parsed.pid)) {
      return
    }

    await rm(file, { force: true })
  }).pipe(Effect.catchAll(() => Effect.void))

const isProcessAlive = (pid: number) => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}
