import type { Effect, ManagedRuntime } from "effect"

import { cache } from "react"

import type { ServerRuntime } from "../../runtime.ts"

type ServerServices = ServerRuntime extends ManagedRuntime.ManagedRuntime<infer R, any> ? R : never

const getServerRuntime = (): ServerRuntime => {
  const runtime = (globalThis as { readonly serverRuntime?: ServerRuntime }).serverRuntime
  if (!runtime) {
    throw new Error("Server runtime has not been initialized.")
  }

  return runtime
}

export const runServerEffect = <A, E>(effect: Effect.Effect<A, E, ServerServices>): Promise<A> =>
  getServerRuntime().runPromise(effect)

export const serverFunction =
  <Args extends ReadonlyArray<unknown>, A, E>(body: (...args: Args) => Effect.Effect<A, E, ServerServices>) =>
  (...args: Args): Promise<A> =>
    runServerEffect(body(...args))

export const cachedServerFunction = <Args extends ReadonlyArray<unknown>, A, E>(
  body: (...args: Args) => Effect.Effect<A, E, ServerServices>
): ((...args: Args) => Promise<A>) => cache(serverFunction(body))
