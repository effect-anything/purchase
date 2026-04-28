import type { i18n as I18nInstance } from "i18next"

import { makeConfigProvider } from "./config.ts"
import { withGlobalLogLevel } from "./logger.ts"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as ManagedRuntime from "effect/ManagedRuntime"

interface LoadContextParams {
  env: Record<string, any>
  caches: globalThis.CacheStorage
  waitUntil: (promise: Promise<any>) => void
  passThroughOnException: () => void
}

interface HandleAppLoadContext {
  env: Record<string, any>
  waitUntil: (promise: Promise<any>) => void
  passThroughOnException: () => void
  runtime: ManagedRuntime.ManagedRuntime<never, never>
  i18n?: I18nInstance
}

export type make = <A>(
  layer: Layer.Layer<A>,
  options?: {
    getLoadContext?: (params: LoadContextParams) => Record<string, any>
  }
) => {
  getLoadContext: (params: LoadContextParams) => HandleAppLoadContext
}

export function make<A>(
  layer: Layer.Layer<A, never>,
  options: {
    getLoadContext?: (params: LoadContextParams) => Record<string, any>
  } = {}
): ReturnType<make> {
  return {
    getLoadContext: (params: LoadContextParams) => {
      const runtime = ManagedRuntime.make(
        Layer.provideMerge(
          layer,
          pipe(
            Layer.mergeAll(Layer.setConfigProvider(makeConfigProvider(params.env))),
            Layer.provide(withGlobalLogLevel(params.env))
          )
        )
      )

      return {
        ...options.getLoadContext?.(params),
        ...params,
        runtime
      }
    }
  }
}
