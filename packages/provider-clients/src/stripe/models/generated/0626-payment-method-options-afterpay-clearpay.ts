import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsAfterpayClearpay = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
  reference: Schema.NullOr(Schema.String),
  setup_future_usage: Schema.optional(Schema.Literal("none"))
})
export type PaymentMethodOptionsAfterpayClearpay = typeof PaymentMethodOptionsAfterpayClearpay.Type
