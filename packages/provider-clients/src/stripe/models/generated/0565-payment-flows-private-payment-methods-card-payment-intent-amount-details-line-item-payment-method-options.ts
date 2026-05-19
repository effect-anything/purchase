import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsCardPaymentIntentAmountDetailsLineItemPaymentMethodOptions = Schema.Struct({
  commodity_code: Schema.NullOr(Schema.String),
})
export type PaymentFlowsPrivatePaymentMethodsCardPaymentIntentAmountDetailsLineItemPaymentMethodOptions = typeof PaymentFlowsPrivatePaymentMethodsCardPaymentIntentAmountDetailsLineItemPaymentMethodOptions.Type
