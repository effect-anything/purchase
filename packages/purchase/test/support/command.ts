import type { Readable } from "node:stream"

import * as Effect from "effect/Effect"
import { execFile, spawn, spawnSync, type ChildProcessByStdio } from "node:child_process"

export interface CommandOutput {
  readonly stdout: string
  readonly stderr: string
}

export const commandExistsSync = (command: string) => {
  const child = spawnSync("sh", ["-lc", `command -v ${command}`], {
    stdio: "ignore"
  })

  return child.status === 0
}

export const execFileText = (command: string, args: ReadonlyArray<string>, env?: NodeJS.ProcessEnv) =>
  Effect.tryPromise({
    try: () =>
      new Promise<CommandOutput>((resolve, reject) => {
        execFile(command, args, { env }, (error, stdout, stderr) => {
          if (error) {
            reject(error)
            return
          }

          resolve({
            stdout,
            stderr
          })
        })
      }),
    catch: (cause) => cause
  })

export const spawnTextProcess = (command: string, args: ReadonlyArray<string>, env?: NodeJS.ProcessEnv) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const child = spawn(command, args, {
        env,
        stdio: ["ignore", "pipe", "pipe"]
      })

      return child
    }),
    (child) =>
      Effect.sync(() => {
        child.kill("SIGTERM")
      }).pipe(Effect.catchAllDefect(() => Effect.void))
  )

export const waitForProcessOutput = (
  child: ChildProcessByStdio<null, Readable, Readable>,
  predicate: (chunk: string) => boolean,
  timeoutMs = 15_000
) =>
  Effect.tryPromise({
    try: () =>
      new Promise<string>((resolve, reject) => {
        let combined = ""
        const timer = setTimeout(() => {
          cleanup()
          reject(new Error(`Timed out waiting for process output after ${timeoutMs}ms`))
        }, timeoutMs)

        const onChunk = (chunk: Buffer) => {
          const text = chunk.toString()
          combined += text
          if (predicate(combined)) {
            cleanup()
            resolve(combined)
          }
        }

        const onExit = (code: number | null) => {
          cleanup()
          reject(new Error(`Process exited before expected output (code: ${String(code)})\n${combined}`))
        }

        const cleanup = () => {
          clearTimeout(timer)
          child.stdout.off("data", onChunk)
          child.stderr.off("data", onChunk)
          child.off("exit", onExit)
        }

        child.stdout.on("data", onChunk)
        child.stderr.on("data", onChunk)
        child.on("exit", onExit)
      }),
    catch: (cause) => cause
  })
