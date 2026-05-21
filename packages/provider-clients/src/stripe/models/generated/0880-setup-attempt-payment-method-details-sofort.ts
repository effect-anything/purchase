import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SetupAttemptPaymentMethodDetailsSofort = {
  readonly bank_code: string | null
  readonly bank_name: string | null
  readonly bic: string | null
  readonly generated_sepa_debit: string | Models.PaymentMethod | null
  readonly generated_sepa_debit_mandate: string | Models.Mandate | null
  readonly iban_last4: string | null
  readonly preferred_language: "de" | "en" | "fr" | "nl" | null
  readonly verified_name: string | null
}

export const SetupAttemptPaymentMethodDetailsSofort = Schema.Struct({
  bank_code: Schema.NullOr(Schema.String),
  bank_name: Schema.NullOr(Schema.String),
  bic: Schema.NullOr(Schema.String),
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
  preferred_language: Schema.NullOr(Schema.Literal("de", "en", "fr", "nl")),
  verified_name: Schema.NullOr(Schema.String)
})
