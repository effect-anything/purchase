import type { KV } from "@effect-x/server/kv"
import type { S3 } from "@effect-x/server/s3"
import type { Unstable_Config } from "wrangler"

import * as dotenv from "@dotenvx/dotenvx"
import { CloudflareBindings } from "./bindings.ts"
import * as CacheStorage from "./cache-storage.ts"
import { makeConfigProvider } from "./config-provider.ts"
import { CloudflareLive } from "./context.ts"
import { CloudflareExecutionContext } from "./execution-context.ts"
import { withGlobalLogLevel } from "@effect-x/server/logger"
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as Path from "@effect/platform/Path"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import { workspaceRoot } from "./utils.ts"

type SignalHandler = (...args: Array<unknown>) => void

// Wrangler installs SIGINT/SIGTERM listeners that call process.exit(). We wrap them so
// other listeners finish cleanup before we optionally exit.
const wranglerSignals: ReadonlyArray<NodeJS.Signals> = ["SIGINT", "SIGTERM"]

const baselineListeners = new Map<NodeJS.Signals, Set<SignalHandler>>(
  wranglerSignals.map((signal) => [signal, new Set(process.listeners(signal) as Array<SignalHandler>)])
)

const originalToWrapped = new WeakMap<SignalHandler, SignalHandler>()
const wrappedToOriginal = new WeakMap<SignalHandler, SignalHandler>()

// Snapshot the current listeners so we only touch the ones Wrangler registers later.

const wrap = (handler: SignalHandler): SignalHandler => {
  const existing = originalToWrapped.get(handler)

  if (existing) {
    return existing
  }

  const wrapped: SignalHandler = (...args) => {
    const originalExit = process.exit

    process.exit = ((_code?: number) => {
      return undefined as never
    }) as typeof process.exit

    try {
      handler(...args)
    } finally {
      process.exit = originalExit
    }
  }

  originalToWrapped.set(handler, wrapped)
  wrappedToOriginal.set(wrapped, handler)

  return wrapped
}

const applyWranglerSignalPatch = () => {
  for (const signal of wranglerSignals) {
    const baseline = baselineListeners.get(signal)

    for (const listener of process.listeners(signal) as Array<SignalHandler>) {
      if (wrappedToOriginal.has(listener) || baseline?.has(listener)) {
        continue
      }

      const wrapped = wrap(listener)
      process.removeListener(signal, listener)
      process.on(signal, wrapped)
    }
  }
}

export const parseConfig = Effect.fn("wrangler.parse-config")(function* (
  path: string | Array<string>,
  nodeEnv: "development" | "production" = "development",
  stage: "test" | "staging" | "production" = "test"
) {
  // Test 表示测试环境, Staging 表示预发布环境, 为空表示生产环境或者本地沿用生产配置
  const env = nodeEnv === "development" || stage === "production" ? "" : stage

  const config: Option.Option<{ config: Unstable_Config; path: string }> = yield* pipe(
    Effect.promise(() => import("wrangler")),
    Effect.withSpan("wrangler.import"),
    Effect.flatMap(({ unstable_readConfig }) =>
      Effect.reduce(
        Array.isArray(path) ? path : [path],
        Option.none<{ config: Unstable_Config; path: string }>(),
        Effect.fnUntraced(function* (acc, configPath) {
          if (Option.isSome(acc)) return acc

          const result: Option.Option<{ config: Unstable_Config; path: string }> = yield* pipe(
            Effect.try(() => unstable_readConfig({ config: configPath, env, remote: false }, { hideWarnings: false })),
            Effect.tapErrorCause(Effect.logError),
            Effect.map((loadedConfig) => Option.some({ config: loadedConfig, path: configPath })),
            Effect.orElseSucceed(() => Option.none()),
            Effect.withSpan("wrangler.readConfig", {
              attributes: {
                configPath,
                env
              }
            })
          )

          return result
        })
      )
    ),
    Effect.tap(() => {
      applyWranglerSignalPatch()
    }),
    Effect.tapErrorCause(Effect.logError),
    Effect.orDie
  )

  // const config: Option.Option<{ config: Unstable_Config; path: string }> = yield*
  if (Option.isNone(config)) {
    return yield* Effect.dieMessage(`No configuration found, ${path}`)
  }

  return config.value
})

const layer = (options: {
  configPath: string
  run?: "local" | "remote" | undefined
  environment?: string | undefined
}) =>
  Layer.unwrapScoped(
    Effect.gen(function* () {
      const configPath = options.configPath
      const path = yield* Path.Path

      const env = yield* Effect.sync(
        () =>
          dotenv.config({
            envKeysFile: path.join(workspaceRoot, ".env.keys"),
            path: [path.join(path.dirname(configPath), ".env"), path.join(path.dirname(configPath), ".env.local")],
            quiet: true,
            ignore: ["MISSING_ENV_FILE"],
            processEnv: {}
          }).parsed || {}
      ).pipe(Effect.withSpan("dotenv.load"))

      const platformProxy = yield* Effect.acquireRelease(
        pipe(
          Effect.promise(() => import("wrangler")),
          Effect.withSpan("wrangler.import"),
          Effect.flatMap(({ getPlatformProxy }) =>
            Effect.tryPromise(() =>
              getPlatformProxy({
                configPath: options.configPath,
                envFiles: [],
                persist: {
                  path: path.join(workspaceRoot, ".wrangler/state/v3")
                },
                environment: options.environment ?? ""
              })
            )
          ),
          Effect.tap(() => {
            applyWranglerSignalPatch()
          }),
          Effect.withSpan("wrangler.get-platform-proxy"),
          Effect.tapErrorCause(Effect.logError),
          Effect.orDie
        ),
        (proxyInstance) => {
          return Effect.promise(() => proxyInstance.dispose()).pipe(Effect.withSpan("wrangler.stop-platform-proxy"))
        }
      )

      Object.assign(platformProxy.env, env)

      return pipe(
        Layer.mergeAll(
          CloudflareBindings.fromEnv(platformProxy.env),
          CloudflareExecutionContext.fromContext(platformProxy.ctx, platformProxy.env),
          CacheStorage.fromGlobalCaches,
          Layer.setConfigProvider(makeConfigProvider(platformProxy.env))
        ),
        Layer.provide(withGlobalLogLevel(platformProxy.env))
      )
    }).pipe(Effect.withSpan("wrangler.initRuntime"))
  )

export const runMain = <A>(
  effect: Effect.Effect<A, never, KV | S3>,
  options: { configPath: string; run?: "local" | "remote" | undefined; environment?: string | undefined }
) => {
  NodeRuntime.runMain(
    Effect.provide(
      effect,
      pipe(
        CloudflareLive,
        Layer.provideMerge(layer(options)),
        Layer.provide(NodeContext.layer),
        Layer.tapErrorCause(Effect.logError)
      )
    ),
    { disablePrettyLogger: true }
  )
}
