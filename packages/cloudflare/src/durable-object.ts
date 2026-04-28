/// <reference types="@cloudflare/workers-types" />

import * as Headers from "@effect/platform/Headers"
import * as HttpTraceContext from "@effect/platform/HttpTraceContext"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Schema from "effect/Schema"

type EffectDurableObjectStub<T, E = never> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => R extends Effect.Effect<any, any, any> ? unknown : Effect.Effect<Awaited<R>, RPCError | E>
    : never
}

export class RPCError extends Schema.TaggedError<RPCError>()("RPCError", {
  message: Schema.String,
  reason: Schema.Defect
}) {}

const isFunction = (value: unknown): value is Function => {
  return typeof value === "function"
}

export const wrapStub = <T>(binding: () => DurableObject): EffectDurableObjectStub<T, RPCError> =>
  new Proxy(binding(), {
    get:
      (target, prop, _receiver) =>
      (...args: any) => {
        const method = (target as any)[prop]

        if (!isFunction(method)) {
          return Effect.succeed(method)
        }

        const traceHeaders = Effect.currentSpan.pipe(
          Effect.map(HttpTraceContext.toHeaders),
          Effect.orElseSucceed(() => Headers.empty)
        )

        return pipe(
          traceHeaders,
          Effect.andThen((_headers) =>
            Effect.tryPromise({
              try: () => {
                return Promise.resolve().then(() => method(...args))
              },
              catch: (error: any) => new RPCError({ message: error?.message || "", reason: error })
            })
          ),
          Effect.withSpan(`Durable.${prop.toString()}`, { attributes: { prop: prop.toString() } })
        )
      }
  }) as EffectDurableObjectStub<T, RPCError>

export type DOClass = {
  new (state: DurableObjectState, env: any): DurableObject
}
export const makeDO = (doClass: DOClass) => doClass
