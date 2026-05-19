import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutFpxPaymentMethodOptions = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type CheckoutFpxPaymentMethodOptions = typeof CheckoutFpxPaymentMethodOptions.Type
