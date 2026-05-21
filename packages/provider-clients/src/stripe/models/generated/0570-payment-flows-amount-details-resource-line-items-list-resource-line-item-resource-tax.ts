import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourceTax = Schema.Struct({
  total_tax_amount: Schema.Number
})
export type PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourceTax =
  typeof PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourceTax.Type
