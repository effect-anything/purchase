import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsAlipayDetails = Schema.Struct({
  buyer_id: Schema.optional(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  transaction_id: Schema.NullOr(Schema.String),
})
export type PaymentFlowsPrivatePaymentMethodsAlipayDetails = typeof PaymentFlowsPrivatePaymentMethodsAlipayDetails.Type
