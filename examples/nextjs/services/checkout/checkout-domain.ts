import { PaymentEnvironmentTag, PaymentProviderTag } from "@effect-x/purchase/provider"
import { CheckoutMode } from "@effect-x/purchase/schema"
import { Schema } from "effect"

export const CheckoutStartPayloadSchema = Schema.Struct({
  offerId: Schema.String
})

export const CheckoutStartResultSchema = Schema.Struct({
  offerId: Schema.String,
  intentId: Schema.String,
  sessionId: Schema.String,
  mode: CheckoutMode,
  url: Schema.NullOr(Schema.String)
})

export type CheckoutStartResult = typeof CheckoutStartResultSchema.Type

export const CheckoutStartApiResponseSchema = Schema.Struct({
  environment: PaymentEnvironmentTag,
  provider: PaymentProviderTag,
  checkout: CheckoutStartResultSchema
})
