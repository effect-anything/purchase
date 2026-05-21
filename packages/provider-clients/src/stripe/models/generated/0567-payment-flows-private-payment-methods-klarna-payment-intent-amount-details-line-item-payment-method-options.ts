import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsKlarnaPaymentIntentAmountDetailsLineItemPaymentMethodOptions =
  Schema.Struct({
    image_url: Schema.NullOr(Schema.String),
    product_url: Schema.NullOr(Schema.String),
    reference: Schema.NullOr(Schema.String),
    subscription_reference: Schema.NullOr(Schema.String)
  })
export type PaymentFlowsPrivatePaymentMethodsKlarnaPaymentIntentAmountDetailsLineItemPaymentMethodOptions =
  typeof PaymentFlowsPrivatePaymentMethodsKlarnaPaymentIntentAmountDetailsLineItemPaymentMethodOptions.Type
