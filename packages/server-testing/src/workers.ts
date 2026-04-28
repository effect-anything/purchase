import type * as Vitest from "@effect/vitest"

import { Testing } from "./test.ts"
import * as Test from "@effect-x/testing/test"
import type * as Layer from "effect/Layer"
import * as Effect from "effect/Effect"
import type * as LogLevel from "effect/LogLevel"
import type * as Duration from "effect/Duration"

export { layer, mock, withLayer, withOverrideLayer } from "@effect-x/testing/test"

export const test =
  <R, E, const ExcludeTestServices extends boolean = false>(
    layer_: Layer.Layer<R | Testing, E>,
    options: {
      readonly memoMap?: Layer.MemoMap
      readonly timeout?: Duration.DurationInput
      readonly excludeTestServices?: ExcludeTestServices
      readonly logLevel?: LogLevel.Literal
    } & Vitest.TestOptions = {}
  ) =>
  (
    ...args:
      | [name: string, f: (it: Vitest.Vitest.MethodsNonLive<R, ExcludeTestServices>) => void]
      | [f: (it: Vitest.Vitest.MethodsNonLive<R, ExcludeTestServices>) => void]
  ) =>
    Test.layer(layer_, {
      ...options,
      hooks: {
        beforeEach: Effect.gen(function* () {
          const r = yield* Testing

          yield* r.beforeEach
        }),
        afterEach: Effect.gen(function* () {
          const r = yield* Testing

          yield* r.afterEach
        }),
        mapEffect: (effect, runtime) => Effect.flatMap(Testing, (_) => _.mapEffect(effect, runtime))
      }
    })(...args)
