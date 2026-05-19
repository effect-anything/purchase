import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsUsBankAccount = Schema.Struct({
  account_holder_type: Schema.NullOr(Schema.Literal("company", "individual")),
  account_type: Schema.NullOr(Schema.Literal("checking", "savings")),
  bank_name: Schema.NullOr(Schema.String),
  expected_debit_date: Schema.optional(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  mandate: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Mandate => Models.Mandate))),
  payment_reference: Schema.NullOr(Schema.String),
  routing_number: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsUsBankAccount = typeof PaymentMethodDetailsUsBankAccount.Type
