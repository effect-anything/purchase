import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsNzBankAccount = Schema.Struct({
  account_holder_name: Schema.NullOr(Schema.String),
  bank_code: Schema.String,
  bank_name: Schema.String,
  branch_code: Schema.String,
  expected_debit_date: Schema.optional(Schema.String),
  last4: Schema.String,
  suffix: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsNzBankAccount = typeof PaymentMethodDetailsNzBankAccount.Type
