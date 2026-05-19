import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsAmountDetailsResourceTax = Schema.Struct({
  total_tax_amount: Schema.NullOr(Schema.Number),
})
export type PaymentFlowsAmountDetailsResourceTax = typeof PaymentFlowsAmountDetailsResourceTax.Type
