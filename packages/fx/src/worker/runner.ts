/// <reference lib="webworker" />
/// <reference types="vite/client" />

import type * as WorkerSchema from "./schema.ts"
import type * as Schema from "effect/Schema"
import type * as Stream from "effect/Stream"

import * as OtelGlobals from "@effect-x/otel/session/globals"
import * as BrowserWorkerRunner from "@effect/platform-browser/BrowserWorkerRunner"
import * as WorkerRunner from "@effect/platform/WorkerRunner"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import { globalValue } from "effect/GlobalValue"
import * as Layer from "effect/Layer"
import * as LogLevel from "effect/LogLevel"
import * as Metric from "effect/Metric"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"
import * as Runtime from "effect/Runtime"
import * as Scope from "effect/Scope"
import * as SubscriptionRef from "effect/SubscriptionRef"

const GlobalAccessToken = globalValue("@x/global-access-token", () =>
  Effect.runSync(SubscriptionRef.make(Option.none<Redacted.Redacted<string>>()))
)

export const GlobalLogLevel = globalValue("@fx/worker-loglevel", () =>
  Effect.runSync(SubscriptionRef.make(LogLevel.All))
)

const reportEventLogMessage = (args: any) => {
  // Dedicated workers do not support a targetOrigin argument.
  //
  self.postMessage([99, args])
}

const reportWorkerMetrics = (snapshot: unknown) => {
  // Dedicated workers do not support a targetOrigin argument.
  //
  self.postMessage([98, { type: "dev-metrics", params: {}, data: JSON.stringify(snapshot) }])
}

export const run = <
  R,
  A extends Schema.TaggedRequest.All,
  I,
  Handlers_ extends WorkerRunner.SerializedRunner.Handlers<A>,
  Handlers extends Array<
    (
      scope: Scope.CloseableScope
    ) => Partial<Omit<Handlers_, "InitialMessage" | "RunnerInterrupt" | "WorkerConfigChange">>
  >,
  R2
>(
  schema: Schema.Schema<A, I>,
  layer: Layer.Layer<R, never, Scope.Scope>,
  handlers: Handlers,
  options: {
    layer: Layer.Layer<R2>
  }
) =>
  pipe(
    Effect.gen(function* () {
      const scope = yield* Scope.make()

      const workerLayer = Layer.provide(layer, Layer.succeed(Scope.Scope, scope))
      const applyWorkerConfig = (config: WorkerSchema.InitialMessage | WorkerSchema.WorkerConfigChange) => {
        const setRumSessionId = Effect.sync(() => {
          if (config.sessionId) {
            OtelGlobals.setRumSessionId(config.sessionId)
          }
        })

        const setAccessToken = SubscriptionRef.set(
          GlobalAccessToken,
          Option.fromNullable(config.token).pipe(Option.map(Redacted.make))
        )

        return (
          config.logLevel
            ? SubscriptionRef.set(GlobalLogLevel, LogLevel.fromLiteral(config.logLevel)).pipe(
                Effect.zipRight(setRumSessionId),
                Effect.zipRight(setAccessToken)
              )
            : setRumSessionId.pipe(Effect.zipRight(setAccessToken))
        ) as Effect.Effect<void>
      }

      const userHandles = handlers.reduce(
        (acc, handler) => {
          const handlerMap = handler(scope)

          // oxlint-disable-next-line oxc/no-accumulating-spread
          return { ...acc, ...handlerMap }
        },
        {
          InitialMessage: (config: WorkerSchema.InitialMessage) => {
            return Layer.merge(workerLayer, Layer.effectDiscard(applyWorkerConfig(config)))
          },
          RunnerInterrupt: () => Scope.close(scope, Exit.void),
          WorkerConfigChange: applyWorkerConfig
        } as WorkerRunner.SerializedRunner.Handlers<A>
      )

      const runner = WorkerRunner.layerSerialized(schema, userHandles).pipe(
        Layer.provide(BrowserWorkerRunner.layer)
      ) as unknown as Layer.Layer<never, WorkerRunner.PlatformRunner>

      // @ts-ignore
      globalThis.eventLogMessage = reportEventLogMessage

      if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
        setInterval(() => {
          reportWorkerMetrics(Metric.unsafeSnapshot())
        }, 950)
      }

      yield* BrowserWorkerRunner.launch(runner)
    }),
    Effect.catchAllCause((cause) => {
      if (Cause.isDieType(cause)) {
        if (Cause.isInterruptedException(cause.defect)) {
          return Effect.void
        }
      }

      if (Cause.isInterrupted(cause)) {
        return Effect.void
      }

      return Effect.logError(cause)
    }),
    Effect.provide(options.layer),
    (effect) => {
      const runtime = Effect.runSync(Effect.runtime<never>().pipe(Effect.provide(options.layer)))
      return Runtime.runFork(runtime, effect)
    }
  )

export const handler = <S extends Schema.TaggedRequest.All>(
  fn: (_: Scope.CloseableScope) => {
    [I in S["_tag"]]: (
      _: S extends { _tag: I } ? S : never
    ) =>
      | Effect.Effect<
          S extends { _tag: I } ? Schema.WithResult.Success<S> : never,
          S extends { _tag: I } ? Schema.WithResult.Failure<S> : never,
          any
        >
      | Stream.Stream<
          S extends { _tag: I } ? Schema.WithResult.Success<S> : never,
          S extends { _tag: I } ? Schema.WithResult.Failure<S> : never,
          any
        >
  }
) => {
  return fn
}
