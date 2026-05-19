import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsPaycoPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})
export type PaymentFlowsPrivatePaymentMethodsPaycoPaymentMethodOptions = typeof PaymentFlowsPrivatePaymentMethodsPaycoPaymentMethodOptions.Type
