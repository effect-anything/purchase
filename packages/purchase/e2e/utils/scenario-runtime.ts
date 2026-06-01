import type { Layer } from "effect"

import { inject } from "vitest"

import { Paddle } from "../../src/paddle.ts"
import { isPaymentProvider, type PaymentProvider, type PaymentProviderTag } from "../../src/provider.ts"
import { Stripe } from "../../src/stripe.ts"
import { makeHttpApiTesting, type HttpApiTestingOptions } from "./api.ts"

export interface ScenarioPaymentProvider {
  readonly _tag: PaymentProviderTag
  readonly layer: Layer.Layer<PaymentProvider, any>
}

export const scenarioPaymentProviders = [
  ["Paddle", Paddle],
  ["Stripe", Stripe]
] as const satisfies ReadonlyArray<readonly [string, ScenarioPaymentProvider]>

const providerFilter = process.env.PROVIDER

export const filteredScenarioPaymentProviders = (() => {
  if (!providerFilter) {
    return scenarioPaymentProviders
  }

  if (!isPaymentProvider(providerFilter)) {
    throw new Error(`Unsupported provider filter: ${providerFilter}`)
  }

  return scenarioPaymentProviders.filter(([, provider]) => provider._tag === providerFilter)
})()

export const makeScenarioRuntime = (
  paymentProvider: ScenarioPaymentProvider,
  options?: Partial<Omit<HttpApiTestingOptions, "broker" | "paymentProvider">> | undefined
) => {
  const ctx = inject("purchaseProviderE2E")

  return makeHttpApiTesting({
    broker: ctx.broker,
    paymentProvider,
    ...options
  })
}
