import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodUsBankAccount = Schema.Struct({
  account_holder_type: Schema.NullOr(Schema.Literal("company", "individual")),
  account_type: Schema.NullOr(Schema.Literal("checking", "savings")),
  bank_name: Schema.NullOr(Schema.String),
  financial_connections_account: Schema.NullOr(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  networks: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.UsBankAccountNetworks, any, any> =>
        Models.UsBankAccountNetworks as Schema.Schema<Models.UsBankAccountNetworks, any, any>
    )
  ),
  routing_number: Schema.NullOr(Schema.String),
  status_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodUsBankAccountStatusDetails, any, any> =>
        Models.PaymentMethodUsBankAccountStatusDetails as Schema.Schema<
          Models.PaymentMethodUsBankAccountStatusDetails,
          any,
          any
        >
    )
  )
})
export type PaymentMethodUsBankAccount = typeof PaymentMethodUsBankAccount.Type
