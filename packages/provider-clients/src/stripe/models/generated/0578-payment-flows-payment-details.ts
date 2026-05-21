import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsPaymentDetails = Schema.Struct({
  customer_reference: Schema.NullOr(Schema.String),
  order_reference: Schema.NullOr(Schema.String)
})
export type PaymentFlowsPaymentDetails = typeof PaymentFlowsPaymentDetails.Type
