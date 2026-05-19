import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutSatispayPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})
export type CheckoutSatispayPaymentMethodOptions = typeof CheckoutSatispayPaymentMethodOptions.Type
