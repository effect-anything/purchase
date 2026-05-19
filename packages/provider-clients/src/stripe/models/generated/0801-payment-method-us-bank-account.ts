import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodUsBankAccount = Schema.Struct({
  account_holder_type: Schema.NullOr(Schema.Literal("company", "individual")),
  account_type: Schema.NullOr(Schema.Literal("checking", "savings")),
  bank_name: Schema.NullOr(Schema.String),
  financial_connections_account: Schema.NullOr(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  networks: Schema.NullOr(Schema.suspend((): typeof Models.UsBankAccountNetworks => Models.UsBankAccountNetworks)),
  routing_number: Schema.NullOr(Schema.String),
  status_details: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodUsBankAccountStatusDetails => Models.PaymentMethodUsBankAccountStatusDetails)),
})
export type PaymentMethodUsBankAccount = typeof PaymentMethodUsBankAccount.Type
