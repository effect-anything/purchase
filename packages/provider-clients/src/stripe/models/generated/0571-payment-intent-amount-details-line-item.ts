import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentAmountDetailsLineItem = Schema.Struct({
  discount_amount: Schema.NullOr(Schema.Number),
  id: Schema.String,
  object: Schema.Literal("payment_intent_amount_details_line_item"),
  payment_method_options: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourcePaymentMethodOptions,
        any,
        any
      > =>
        Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourcePaymentMethodOptions as Schema.Schema<
          Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourcePaymentMethodOptions,
          any,
          any
        >
    )
  ),
  product_code: Schema.NullOr(Schema.String),
  product_name: Schema.String,
  quantity: Schema.Number,
  tax: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourceTax, any, any> =>
        Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourceTax as Schema.Schema<
          Models.PaymentFlowsAmountDetailsResourceLineItemsListResourceLineItemResourceTax,
          any,
          any
        >
    )
  ),
  unit_cost: Schema.Number,
  unit_of_measure: Schema.NullOr(Schema.String)
})
export type PaymentIntentAmountDetailsLineItem = typeof PaymentIntentAmountDetailsLineItem.Type
