import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutAuBecsDebitPaymentMethodOptions = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
  target_date: Schema.optional(Schema.String)
})
export type CheckoutAuBecsDebitPaymentMethodOptions = typeof CheckoutAuBecsDebitPaymentMethodOptions.Type
