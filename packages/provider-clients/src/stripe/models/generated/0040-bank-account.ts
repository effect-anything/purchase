import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BankAccount = Schema.Struct({
  account: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account)))),
  account_holder_name: Schema.NullOr(Schema.String),
  account_holder_type: Schema.NullOr(Schema.String),
  account_type: Schema.NullOr(Schema.String),
  available_payout_methods: Schema.optional(Schema.NullOr(Schema.Array(Schema.Literal("instant", "standard")))),
  bank_name: Schema.NullOr(Schema.String),
  country: Schema.String,
  currency: Schema.String,
  customer: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer), Schema.suspend((): typeof Models.DeletedCustomer => Models.DeletedCustomer)))),
  default_for_currency: Schema.optional(Schema.NullOr(Schema.Boolean)),
  fingerprint: Schema.NullOr(Schema.String),
  future_requirements: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.ExternalAccountRequirements => Models.ExternalAccountRequirements))),
  id: Schema.String,
  last4: Schema.String,
  metadata: Schema.optional(Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String }))),
  object: Schema.Literal("bank_account"),
  requirements: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.ExternalAccountRequirements => Models.ExternalAccountRequirements))),
  routing_number: Schema.NullOr(Schema.String),
  status: Schema.String,
})
export type BankAccount = typeof BankAccount.Type
