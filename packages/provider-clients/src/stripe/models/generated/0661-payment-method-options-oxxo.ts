import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsOxxo = Schema.Struct({
  expires_after_days: Schema.Number,
  setup_future_usage: Schema.optional(Schema.Literal("none"))
})
export type PaymentMethodOptionsOxxo = typeof PaymentMethodOptionsOxxo.Type
