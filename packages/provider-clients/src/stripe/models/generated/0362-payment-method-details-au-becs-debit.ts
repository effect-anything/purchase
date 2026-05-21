import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsAuBecsDebit = Schema.Struct({
  bsb_number: Schema.NullOr(Schema.String),
  expected_debit_date: Schema.optional(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  mandate: Schema.optional(Schema.String)
})
export type PaymentMethodDetailsAuBecsDebit = typeof PaymentMethodDetailsAuBecsDebit.Type
