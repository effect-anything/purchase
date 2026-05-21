import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordSofort = Schema.Struct({
  bank_code: Schema.NullOr(Schema.String),
  bank_name: Schema.NullOr(Schema.String),
  bic: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  generated_sepa_debit: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethod, any, any> =>
          Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
      )
    )
  ),
  generated_sepa_debit_mandate: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Mandate, any, any> => Models.Mandate as Schema.Schema<Models.Mandate, any, any>
      )
    )
  ),
  iban_last4: Schema.NullOr(Schema.String),
  preferred_language: Schema.NullOr(Schema.Literal("de", "en", "es", "fr", "it", "nl", "pl")),
  verified_name: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordSofort = typeof PaymentMethodDetailsPaymentRecordSofort.Type
