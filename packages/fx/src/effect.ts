import type * as Effect from "effect/Effect"
import * as Redacted from "effect/Redacted"

export const redactedRecordInspect = (x: Record<string, any>): Record<string, any> => {
  const inspect = (obj: Record<string, any>): Record<string, any> =>
    Object.fromEntries(
      Object.entries(obj).map(([key, value_]) => {
        const isRedacted = Redacted.isRedacted(value_)
        const value = isRedacted ? Redacted.value(value_) : value_

        if (typeof value === "object" && value !== null) {
          return [key, inspect(value)]
        }

        return [key, isRedacted ? "<redacted>" : value]
      })
    )

  return inspect(x)
}

export const shouldNeverHappen = (msg?: string, ...args: Array<any>): never => {
  console.error(msg, ...args)

  // @ts-ignore
  if (process.env.NODE_ENV === "development") {
  }

  throw new Error(`This should never happen: ${msg}`)
}

/**
 * Derives the return type for a service method, strictly preserving the
 * method's full type signature (success, error, and context).
 *
 * Unlike `RpcGroupHandlesReturns` (where RPC schemas have no context channel
 * and `R` must be declared explicitly), service interfaces already define the
 * complete `Effect.Effect<A, E, R>` — including dependencies. The implementation
 * must conform exactly; any extra dependency is a compile error, not something
 * to be declared via a generic.
 *
 * @typeParam T - The service method type (from `Context.Tag.Service<MyService>[key]`)
 * @typeParam R - Optional additional context requirements to merge with the method's context
 *
 * @example
 * ```ts
 * export class MyService extends Context.Tag('MyService')<MyService, {
 *   readonly list: () => Effect.Effect<Items, MyError>
 *   readonly data: Effect.Effect<Data, MyError>
 * }>() {}
 *
 * export declare namespace MyService {
 *   export type Methods = Context.Tag.Service<MyService>
 *   export type Returns<key extends keyof Methods, R = never> = ServicesReturns<Methods[key], R>
 * }
 *
 * const list: MyService.Methods['list'] = Effect.fn('list')(
 *   function* (): MyService.Returns<'list'> {
 *     // return type is locked to Effect.Effect<Items, MyError, never>
 *     ...
 *   }
 * )
 *
 * // With additional context
 * const listWithLogger: MyService.Methods['list'] = Effect.fn('list')(
 *   function* (): MyService.Returns<'list', Logger> {
 *     // return type is Effect.Effect<Items, MyError, Logger>
 *     const logger = yield* Logger
 *     ...
 *   }
 * )
 * ```
 */
export type ServicesReturns<T, R = never> = T extends (...args: any) => Effect.Effect<infer A, infer E, infer R0>
  ? Effect.fn.Return<A, E, R0 | R>
  : T extends Effect.Effect<infer A, infer E, infer R0>
    ? Effect.fn.Return<A, E, R0 | R>
    : T
