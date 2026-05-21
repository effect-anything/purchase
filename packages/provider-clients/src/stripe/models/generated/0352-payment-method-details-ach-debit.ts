import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsAchDebit = Schema.Struct({
  account_holder_type: Schema.NullOr(Schema.Literal("company", "individual")),
  bank_name: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  routing_number: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsAchDebit = typeof PaymentMethodDetailsAchDebit.Type
