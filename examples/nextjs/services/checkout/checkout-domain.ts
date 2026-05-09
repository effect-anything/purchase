import { Schema } from "effect"

export const CheckoutStartPayloadSchema = Schema.Struct({
  offerId: Schema.String
})

export const CheckoutStartResultSchema = Schema.Struct({
  offerId: Schema.String,
  intentId: Schema.String,
  sessionId: Schema.String,
  url: Schema.NullOr(Schema.String)
})

export type CheckoutStartResult = typeof CheckoutStartResultSchema.Type

export const CheckoutStartApiResponseSchema = Schema.Struct({
  environment: Schema.String,
  provider: Schema.String,
  checkout: CheckoutStartResultSchema
})
