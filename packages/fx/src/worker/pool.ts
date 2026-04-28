import type { DurationInput } from "effect/Duration"
import type * as Schema from "effect/Schema"

import * as WorkerRunnerSchema from "./schema.ts"
import * as OtelGlobals from "@effect-x/otel/session/globals"
import { findCookieByName } from "@effect-x/react-router/cookie"
import * as BrowserWorker from "@effect/platform-browser/BrowserWorker"
import * as EffectWorker from "@effect/platform/Worker"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as LogLevel from "effect/LogLevel"
import * as Runtime from "effect/Runtime"
import * as RuntimeFlags from "effect/RuntimeFlags"

export const getWorkerType = () => {
  // @ts-ignore
  const isDesktop: boolean = globalThis.isDesktop || (typeof window !== "undefined" && "__TAURI__" in window)

  return isDesktop ? "desktop-worker" : "web"
}

export interface CoreWorkerPool<I extends Schema.TaggedRequest.All> extends EffectWorker.SerializedWorkerPool<I> {}
export const CoreWorkerPool = Context.GenericTag<CoreWorkerPool<any>>("@client:core-worker-pool")

export type PoolOptions =
  | {
      size: number
      concurrency?: number
      workerFactory: (id: number) => Worker
    }
  | {
      maxSize: number
      minSize: number
      concurrency?: number
      targetUtilization?: number
      timeToLive: DurationInput
      workerFactory: (id: number) => Worker
    }

export const LogStorageKey = "x-log-level"
const noopDevMetricsHandle = (_data: any) => {}

export const getCurrentLogLevel = () => {
  if (import.meta.env.DEV) {
    const logLevel: LogLevel.Literal =
      // @ts-ignore
      globalThis.__x_log_level || (typeof localStorage !== "undefined" && localStorage.getItem(LogStorageKey))

    const level = logLevel ? LogLevel.fromLiteral(logLevel) : LogLevel.All

    return level
  }

  return LogLevel.Info
}

export const make = (options: PoolOptions) =>
  Effect.gen(function* () {
    let devMetricsHandle = noopDevMetricsHandle
    const runtime = yield* Effect.runtime<never>()
    const runFork = Runtime.runFork(runtime)
    const { workerFactory, ...rest } = options

    const workerLayer = BrowserWorker.layer((id) => {
      const worker = workerFactory(id)

      worker.addEventListener("message", (event) => {
        const eventData = event.data
        if (Array.isArray(eventData)) {
          const [port, data] = eventData

          if (port === 98) {
            try {
              if (data.type === "dev-metrics") {
                try {
                  devMetricsHandle(data.data)
                } catch {}

                return
              }
              ;(globalThis as any).externalReport(data.type, data.params, data.data)
            } catch {}

            return
          }

          return
        }
      })

      return worker
    })

    const pool = yield* pipe(
      EffectWorker.makePoolSerialized<WorkerRunnerSchema.WorkerMessage>({
        ...rest,
        initialMessage: () => {
          const token = findCookieByName("x-session", document.cookie)

          return new WorkerRunnerSchema.InitialMessage({
            sessionId: OtelGlobals.rumSessionId,
            logLevel: getCurrentLogLevel()._tag,
            token
          })
        }
      }),
      Effect.provide(Layer.mergeAll(workerLayer, RuntimeFlags.disableRuntimeMetrics)),
      Effect.acquireRelease(
        Effect.fn(function* (workerPool) {
          // @ts-ignore
          globalThis.__x_worker_metrics = null
          // @ts-ignore
          globalThis.__x_log_change = null

          yield* workerPool.executeEffect(new WorkerRunnerSchema.RunnerInterrupt()).pipe(Effect.ignore)
        })
      )
    )

    if (import.meta.env.DEV) {
      // @ts-ignore
      globalThis.__x_worker_metrics = (cb) => {
        devMetricsHandle = cb
      }
    }

    OtelGlobals.eventTarget.addEventListener("session-changed", ({ payload }) => {
      runFork(
        pool.executeEffect(
          new WorkerRunnerSchema.WorkerConfigChange({
            sessionId: payload.sessionId
          })
        )
      )
    })

    // @ts-ignore
    globalThis.__x_log_change = (level: LogLevel["_tag"]) => {
      runFork(
        pool.executeEffect(
          new WorkerRunnerSchema.WorkerConfigChange({
            logLevel: level
          })
        )
      )
    }

    // @ts-ignore
    globalThis.__x_token_change = (forceToken?: string | undefined) => {
      const token = forceToken ?? findCookieByName("x-session", document.cookie)

      runFork(
        pool.executeEffect(
          new WorkerRunnerSchema.WorkerConfigChange({
            token
          })
        )
      )
    }

    return pool
  })
