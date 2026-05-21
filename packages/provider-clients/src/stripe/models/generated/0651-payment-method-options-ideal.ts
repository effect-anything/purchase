import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsIdeal = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session"))
})
export type PaymentMethodOptionsIdeal = typeof PaymentMethodOptionsIdeal.Type
