import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutKonbiniPaymentMethodOptions = Schema.Struct({
  expires_after_days: Schema.NullOr(Schema.Number),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type CheckoutKonbiniPaymentMethodOptions = typeof CheckoutKonbiniPaymentMethodOptions.Type
