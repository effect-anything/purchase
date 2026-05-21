import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodSepaDebit = Schema.Struct({
  bank_code: Schema.NullOr(Schema.String),
  branch_code: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  generated_from: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SepaDebitGeneratedFrom, any, any> =>
        Models.SepaDebitGeneratedFrom as Schema.Schema<Models.SepaDebitGeneratedFrom, any, any>
    )
  ),
  last4: Schema.NullOr(Schema.String)
})
export type PaymentMethodSepaDebit = typeof PaymentMethodSepaDebit.Type
