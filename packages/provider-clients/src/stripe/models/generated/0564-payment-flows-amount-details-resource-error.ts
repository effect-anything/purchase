import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsAmountDetailsResourceError = Schema.Struct({
  code: Schema.NullOr(
    Schema.Literal("amount_details_amount_mismatch", "amount_details_tax_shipping_discount_greater_than_amount")
  ),
  message: Schema.NullOr(Schema.String)
})
export type PaymentFlowsAmountDetailsResourceError = typeof PaymentFlowsAmountDetailsResourceError.Type
