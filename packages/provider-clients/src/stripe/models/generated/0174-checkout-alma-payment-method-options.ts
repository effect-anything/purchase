import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutAlmaPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})
export type CheckoutAlmaPaymentMethodOptions = typeof CheckoutAlmaPaymentMethodOptions.Type
