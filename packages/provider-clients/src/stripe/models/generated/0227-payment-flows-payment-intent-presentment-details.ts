import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsPaymentIntentPresentmentDetails = Schema.Struct({
  presentment_amount: Schema.Number,
  presentment_currency: Schema.String,
})
export type PaymentFlowsPaymentIntentPresentmentDetails = typeof PaymentFlowsPaymentIntentPresentmentDetails.Type
