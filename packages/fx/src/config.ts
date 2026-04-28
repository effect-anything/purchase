import type { LazyArg } from "effect/Function"

import * as dotenvx from "@dotenvx/dotenvx"
import * as PlatformError from "@effect/platform/Error"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Context from "effect/Context"
import * as DefaultServices from "effect/DefaultServices"
import * as Effect from "effect/Effect"
import * as FiberRef from "effect/FiberRef"
import * as Layer from "effect/Layer"

type Env = [string, any]

const make = (env: Record<string, any>, external: LazyArg<Array<Env>> = () => []) => {
  const builtin = [] as Array<Env>
  const normalEnv: Array<Env> = Object.entries(env)
    .filter(([_k, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    .map(([k, v]) => [k, v] as Env)
  const envs = normalEnv.concat(external()).concat(builtin)

  return ConfigProvider.fromMap(new Map(envs))
}

export const providerGlobalEnv =
  (env: Record<string, any>, external: LazyArg<Array<Env>> = () => []) =>
  <A, E, R>(layer: Layer.Layer<A, E, R>) =>
    Layer.provide(layer, Layer.setConfigProvider(make(env, external)))

/** @internal */
const fromDotEnv = (
  path: string,
  config?: Partial<ConfigProvider.ConfigProvider.FromMapConfig> & { envKeysFile?: string | undefined }
): Effect.Effect<ConfigProvider.ConfigProvider, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    const parsed = yield* Effect.try({
      try: () =>
        dotenvx.config({
          envKeysFile: config?.envKeysFile ?? ".env.keys",
          quiet: true,
          processEnv: {},
          path,
          strict: true
        }),
      catch: (error) =>
        new PlatformError.SystemError({
          method: "fromDotEnv",
          reason: "NotFound",
          module: "FileSystem",
          description: "Environment variables file not found",
          cause: error
        })
    }).pipe(Effect.map((_) => _.parsed ?? {}))

    return ConfigProvider.fromMap(
      new Map(Object.entries(parsed)),
      Object.assign({}, { pathDelim: "_", seqDelim: "," }, config)
    )
  })

export const layerDotEnv = (
  path: string,
  config?: { envKeysFile?: string | undefined }
): Layer.Layer<never, PlatformError.PlatformError> =>
  fromDotEnv(path, config).pipe(Effect.map(Layer.setConfigProvider), Layer.unwrapEffect)

export const layerDotEnvAdd = (
  path: string,
  config?: { envKeysFile?: string | undefined }
): Layer.Layer<never, never> =>
  Effect.gen(function* () {
    const dotEnvConfigProvider = yield* Effect.orElseSucceed(fromDotEnv(path, config), () => null)

    if (dotEnvConfigProvider === null) {
      yield* Effect.logDebug(`File '${path}' not found, skipping dotenv ConfigProvider.`)
      return Layer.empty
    }

    const currentConfigProvider = yield* FiberRef.get(DefaultServices.currentServices).pipe(
      Effect.map((services) => Context.get(services, ConfigProvider.ConfigProvider))
    )
    const configProvider = ConfigProvider.orElse(currentConfigProvider, () => dotEnvConfigProvider)
    return Layer.setConfigProvider(configProvider)
  }).pipe(Layer.unwrapEffect)
// test change
