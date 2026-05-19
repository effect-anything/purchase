import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsSepaDebit = Schema.Struct({
  bank_code: Schema.NullOr(Schema.String),
  branch_code: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  expected_debit_date: Schema.optional(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  mandate: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsSepaDebit = typeof PaymentMethodDetailsSepaDebit.Type
