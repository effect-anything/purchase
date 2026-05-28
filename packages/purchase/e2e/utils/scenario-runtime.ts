import { Paddle } from "@effect-x/purchase/paddle"
import { inject } from "vitest"

import { makeHttpApiTesting, type HttpApiTestingOptions } from "./api.ts"

export const makeScenarioRuntime = (overrides?: Partial<Omit<HttpApiTestingOptions, "broker">>) => {
  const ctx = inject("purchaseProviderE2E")

  return makeHttpApiTesting({
    broker: ctx.broker,
    paymentClient: Paddle,
    ...overrides
  })
}
