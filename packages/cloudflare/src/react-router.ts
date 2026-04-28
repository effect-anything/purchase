import type { i18n as I18nInstance } from "i18next"

import { CloudflareBindings } from "./bindings.ts"
import * as CacheStorage from "./cache-storage.ts"
import { makeConfigProvider } from "./config-provider.ts"
import { CloudflareExecutionContext } from "./execution-context.ts"
import { withGlobalLogLevel } from "@effect-x/server/logger"
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
  i18n?: I18nInstance | undefined
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
            Layer.mergeAll(
              CloudflareBindings.fromEnv(params.env),
              CloudflareExecutionContext.fromContext(
                {
                  waitUntil: params.waitUntil,
                  passThroughOnException: params.passThroughOnException,
                  props: {}
                },
                params.env
              ),
              CacheStorage.fromCaches(params.caches as any),
              Layer.setConfigProvider(makeConfigProvider(params.env))
            ),
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
