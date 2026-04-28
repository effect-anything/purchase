import type * as Effect from "effect/Effect"

import * as Context from "effect/Context"

import type { PaymentClient } from "./client.ts"
import type { PaymentProviderTag } from "./type.ts"

export interface PaymentImpl {
  readonly _tag: PaymentProviderTag
  readonly make: Effect.Effect<PaymentClient, never, never>
}
export const PaymentImpl = Context.GenericTag<PaymentImpl>("@pay:payment-impl")
