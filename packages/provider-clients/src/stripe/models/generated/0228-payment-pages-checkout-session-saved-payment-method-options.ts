import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionSavedPaymentMethodOptions = Schema.Struct({
  allow_redisplay_filters: Schema.NullOr(Schema.Array(Schema.Literal("always", "limited", "unspecified"))),
  payment_method_remove: Schema.NullOr(Schema.Literal("disabled", "enabled")),
  payment_method_save: Schema.NullOr(Schema.Literal("disabled", "enabled"))
})
export type PaymentPagesCheckoutSessionSavedPaymentMethodOptions =
  typeof PaymentPagesCheckoutSessionSavedPaymentMethodOptions.Type
