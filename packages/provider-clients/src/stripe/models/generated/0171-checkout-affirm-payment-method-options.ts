import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutAffirmPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type CheckoutAffirmPaymentMethodOptions = typeof CheckoutAffirmPaymentMethodOptions.Type
