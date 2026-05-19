import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentAmountDetailsLineItem = Schema.Struct({
  discount_amount: Schema.NullOr(Schema.Number),
  id: Schema.String,
  object: Schema.Literal("payment_intent_amount_details_line_item"),
  payment_method_options: Schema.NullOr(Schema.suspend((): typeof Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourcePaymentMethodOptions => Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourcePaymentMethodOptions)),
  product_code: Schema.NullOr(Schema.String),
  product_name: Schema.String,
  quantity: Schema.Number,
  tax: Schema.NullOr(Schema.suspend((): typeof Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourceTax => Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourceTax)),
  unit_cost: Schema.Number,
  unit_of_measure: Schema.NullOr(Schema.String),
})
export type PaymentIntentAmountDetailsLineItem = typeof PaymentIntentAmountDetailsLineItem.Type
