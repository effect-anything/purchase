import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodAcssDebit = Schema.Struct({
  bank_name: Schema.NullOr(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  institution_number: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  transit_number: Schema.NullOr(Schema.String),
})
export type PaymentMethodAcssDebit = typeof PaymentMethodAcssDebit.Type
