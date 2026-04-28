import { CloudflareBindings } from "../bindings.ts"
import {
  Miniflare,
  MiniflareLive,
  type TestWorkersConfigModule,
  type TestWorkersModule,
  type TestWorkersOptions
} from "../miniflare.ts"
import * as WorkersTesting from "./workers.ts"
import { RequestAppLoadContext } from "@effect-x/react-router/request"
import type { ServerContextMake } from "@effect-x/server-testing/react-router"
import { Testing } from "@effect-x/server-testing/test"
import * as SqlD1 from "@effect/sql-d1/D1Client"
import * as Effect from "effect/Effect"
import * as FiberRef from "effect/FiberRef"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as LogLevel from "effect/LogLevel"
import type * as ManagedRuntime from "effect/ManagedRuntime"
import * as Option from "effect/Option"
import * as String from "effect/String"
import { resolve } from "node:path"

export { Miniflare }

const noopWaitUntil = () => {}
const noopPassThroughOnException = () => {}

const layer = (options: {
  logLevel?: LogLevel.Literal | undefined
  getLoadContext?: ReturnType<ServerContextMake>["getLoadContext"] | undefined
}) =>
  Layer.effect(
    Testing,
    Effect.gen(function* () {
      const mapEffect = <A, E, R extends never>(
        effect: Effect.Effect<A, E, R>,
        managedRuntime: ManagedRuntime.ManagedRuntime<R, never>
      ) =>
        Effect.flatMap(
          Effect.gen(function* () {
            const miniflare = yield* Miniflare
            const bindings = yield* miniflare.getBindings()
            const caches = yield* miniflare.getCaches()

            const logLevel = options.logLevel ? options.logLevel : (bindings.LOG_LEVEL as LogLevel.Literal)

            const appLoadContext = options.getLoadContext?.({
              env: {
                ...bindings,
                LOG_LEVEL: logLevel
              },
              caches,
              waitUntil: noopWaitUntil,
              passThroughOnException: noopPassThroughOnException
            })

            const requestLoadContext = RequestAppLoadContext.of({
              env: appLoadContext
                ? appLoadContext.env
                : {
                    ...bindings,
                    LOG_LEVEL: logLevel
                  },
              caches,
              waitUntil: noopWaitUntil,
              passThroughOnException: noopPassThroughOnException,
              runtime: appLoadContext ? appLoadContext.runtime : managedRuntime
            })

            return { requestLoadContext, logLevel }
          }),
          ({ requestLoadContext, logLevel }) => {
            const program = pipe(
              effect,
              Effect.provideService(RequestAppLoadContext, requestLoadContext),
              Effect.locally(FiberRef.currentMinimumLogLevel, LogLevel.fromLiteral(logLevel))
            )

            return Effect.promise((signal) => requestLoadContext.runtime.runPromise(program, { signal }))
          }
        )

      const beforeEach = Effect.void

      const afterEach = Effect.gen(function* () {
        yield* reset.resetAll
      }).pipe(Effect.provide(MiniflareLive))

      return {
        mapEffect,
        beforeEach,
        afterEach
      } as any
    })
  )

export const simple = (
  options: {
    configs?: Array<TestWorkersConfigModule> | TestWorkersConfigModule | undefined
    logLevel?: LogLevel.Literal | undefined
    additionalWorkers?: Array<TestWorkersModule> | undefined
  } & TestWorkersOptions = {}
) =>
  pipe(
    layer(options),
    Layer.provideMerge(MiniflareLive),
    Layer.provideMerge(
      Miniflare.Config(options, {
        configs: options.configs ? (Array.isArray(options.configs) ? options.configs : [options.configs]) : [],
        module: options.additionalWorkers ?? []
      })
    )
  )

export const reactRouter = (
  options: {
    cwd: string
    getLoadContext: ReturnType<ServerContextMake>["getLoadContext"]
    logLevel?: LogLevel.Literal | undefined
    additionalWorkers?: Array<TestWorkersModule> | undefined
  } & TestWorkersOptions
) =>
  pipe(
    layer(options),
    Layer.provideMerge(MiniflareLive),
    Layer.provideMerge(
      Miniflare.Config(options, {
        module: [
          {
            path: resolve(options.cwd, "wrangler.jsonc"),
            bundle: false
          },
          ...(options.additionalWorkers ?? []).map((item) => {
            return {
              ...item,
              bundle: item.bundle ?? true
            }
          })
        ]
      })
    )
  )

export const reset = {
  ...WorkersTesting.reset
}

export const setup = {
  ...WorkersTesting.setup,
  withD1:
    (key: string) =>
    <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      effect.pipe(
        Effect.provide(
          Layer.unwrapEffect(
            Effect.gen(function* () {
              const d1 = yield* CloudflareBindings.use((bindings) => bindings.getD1Database(key))

              if (Option.isNone(d1)) {
                return yield* Effect.dieMessage("No miniflare state")
              }

              const sqlLayer = SqlD1.layer({
                db: d1.value,
                transformQueryNames: String.camelToSnake,
                transformResultNames: String.snakeToCamel
              })

              return sqlLayer
            })
          )
        ),
        Effect.orDie
      )
}
