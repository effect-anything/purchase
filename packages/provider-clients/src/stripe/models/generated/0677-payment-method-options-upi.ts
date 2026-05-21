import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsUpi = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("off_session", "on_session"))
})
export type PaymentMethodOptionsUpi = typeof PaymentMethodOptionsUpi.Type
