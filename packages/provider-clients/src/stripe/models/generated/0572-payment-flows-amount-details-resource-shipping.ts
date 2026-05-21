import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsAmountDetailsResourceShipping = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  from_postal_code: Schema.NullOr(Schema.String),
  to_postal_code: Schema.NullOr(Schema.String)
})
export type PaymentFlowsAmountDetailsResourceShipping = typeof PaymentFlowsAmountDetailsResourceShipping.Type
