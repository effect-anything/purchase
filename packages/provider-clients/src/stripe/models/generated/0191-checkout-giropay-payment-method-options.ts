import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutGiropayPaymentMethodOptions = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type CheckoutGiropayPaymentMethodOptions = typeof CheckoutGiropayPaymentMethodOptions.Type
