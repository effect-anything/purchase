import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodNzBankAccount = Schema.Struct({
  account_holder_name: Schema.NullOr(Schema.String),
  bank_code: Schema.String,
  bank_name: Schema.String,
  branch_code: Schema.String,
  last4: Schema.String,
  suffix: Schema.NullOr(Schema.String)
})
export type PaymentMethodNzBankAccount = typeof PaymentMethodNzBankAccount.Type
