import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsBacsDebit = Schema.Struct({
  expected_debit_date: Schema.optional(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  mandate: Schema.NullOr(Schema.String),
  sort_code: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsBacsDebit = typeof PaymentMethodDetailsBacsDebit.Type
