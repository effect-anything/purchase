import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsPaypalAmountDetailsLineItemPaymentMethodOptions = Schema.Struct({
  category: Schema.optional(Schema.Literal("digital_goods", "donation", "physical_goods")),
  description: Schema.optional(Schema.String),
  sold_by: Schema.optional(Schema.String),
})
export type PaymentFlowsPrivatePaymentMethodsPaypalAmountDetailsLineItemPaymentMethodOptions = typeof PaymentFlowsPrivatePaymentMethodsPaypalAmountDetailsLineItemPaymentMethodOptions.Type
