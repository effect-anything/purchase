import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordAcssDebit = Schema.Struct({
  bank_name: Schema.NullOr(Schema.String),
  expected_debit_date: Schema.optional(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  institution_number: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  mandate: Schema.optional(Schema.String),
  transit_number: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordAcssDebit = typeof PaymentMethodDetailsPaymentRecordAcssDebit.Type
