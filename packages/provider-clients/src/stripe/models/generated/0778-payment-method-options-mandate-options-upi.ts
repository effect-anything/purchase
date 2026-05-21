import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsMandateOptionsUpi = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  amount_type: Schema.NullOr(Schema.Literal("fixed", "maximum")),
  description: Schema.NullOr(Schema.String),
  end_date: Schema.NullOr(Schema.Number)
})
export type PaymentMethodOptionsMandateOptionsUpi = typeof PaymentMethodOptionsMandateOptionsUpi.Type
