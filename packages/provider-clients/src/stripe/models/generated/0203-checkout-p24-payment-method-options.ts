import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutP24PaymentMethodOptions = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type CheckoutP24PaymentMethodOptions = typeof CheckoutP24PaymentMethodOptions.Type
