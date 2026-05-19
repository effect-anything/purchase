import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsAmountDetails = Schema.Struct({
  discount_amount: Schema.optional(Schema.Number),
  error: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsAmountDetailsResourceError => Models.PaymentFlowsAmountDetailsResourceError)),
  line_items: Schema.optional(Schema.Struct({
  data: Schema.Array(Schema.suspend((): typeof Models.PaymentIntentAmountDetailsLineItem => Models.PaymentIntentAmountDetailsLineItem)),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})),
  shipping: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsAmountDetailsResourceShipping => Models.PaymentFlowsAmountDetailsResourceShipping)),
  tax: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsAmountDetailsResourceTax => Models.PaymentFlowsAmountDetailsResourceTax)),
  tip: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsAmountDetailsClientResourceTip => Models.PaymentFlowsAmountDetailsClientResourceTip)),
})
export type PaymentFlowsAmountDetails = typeof PaymentFlowsAmountDetails.Type
