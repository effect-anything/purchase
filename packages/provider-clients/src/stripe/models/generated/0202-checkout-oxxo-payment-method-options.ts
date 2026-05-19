import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutOxxoPaymentMethodOptions = Schema.Struct({
  expires_after_days: Schema.Number,
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type CheckoutOxxoPaymentMethodOptions = typeof CheckoutOxxoPaymentMethodOptions.Type
