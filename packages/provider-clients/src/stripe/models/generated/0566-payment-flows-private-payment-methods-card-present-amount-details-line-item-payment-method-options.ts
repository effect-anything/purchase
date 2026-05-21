import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsCardPresentAmountDetailsLineItemPaymentMethodOptions = Schema.Struct({
  commodity_code: Schema.NullOr(Schema.String)
})
export type PaymentFlowsPrivatePaymentMethodsCardPresentAmountDetailsLineItemPaymentMethodOptions =
  typeof PaymentFlowsPrivatePaymentMethodsCardPresentAmountDetailsLineItemPaymentMethodOptions.Type
