import { inject } from "vitest"

import { makeHttpApiTesting, type HttpApiTestingOptions } from "./api.ts"

/**
 * Build the per-test `Live` layer from the vitest-injected broker context.
 *
 * Usage in test files:
 *
 * ```ts
 * import { makeScenarioRuntime } from "../../setup/scenario-runtime.ts"
 *
 * const Live = makeScenarioRuntime()
 *
 * describe("my scenario", () => {
 *   it.effect("does something", () =>
 *     Effect.gen(function* () {
 *       // ...
 *     }).pipe(Effect.provide(Live))
 *   )
 * })
 * ```
 */
export const makeScenarioRuntime = (overrides?: Omit<HttpApiTestingOptions, "broker">) => {
  const ctx = inject("purchaseProviderE2E")

  return makeHttpApiTesting({
    broker: ctx.broker,
    ...overrides
  })
}
