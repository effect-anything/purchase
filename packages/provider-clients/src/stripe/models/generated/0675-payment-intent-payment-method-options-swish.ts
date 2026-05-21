import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptionsSwish = Schema.Struct({
  reference: Schema.NullOr(Schema.String),
  setup_future_usage: Schema.optional(Schema.Literal("none"))
})
export type PaymentIntentPaymentMethodOptionsSwish = typeof PaymentIntentPaymentMethodOptionsSwish.Type
