import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutSamsungPayPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})
export type CheckoutSamsungPayPaymentMethodOptions = typeof CheckoutSamsungPayPaymentMethodOptions.Type
