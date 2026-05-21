import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsSamsungPayPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual"))
})
export type PaymentFlowsPrivatePaymentMethodsSamsungPayPaymentMethodOptions =
  typeof PaymentFlowsPrivatePaymentMethodsSamsungPayPaymentMethodOptions.Type
