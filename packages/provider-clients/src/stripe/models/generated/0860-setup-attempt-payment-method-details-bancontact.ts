import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupAttemptPaymentMethodDetailsBancontact = Schema.Struct({
  bank_code: Schema.NullOr(Schema.String),
  bank_name: Schema.NullOr(Schema.String),
  bic: Schema.NullOr(Schema.String),
  generated_sepa_debit: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentMethod => Models.PaymentMethod))),
  generated_sepa_debit_mandate: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Mandate => Models.Mandate))),
  iban_last4: Schema.NullOr(Schema.String),
  preferred_language: Schema.NullOr(Schema.Literal("de", "en", "fr", "nl")),
  verified_name: Schema.NullOr(Schema.String),
})
export type SetupAttemptPaymentMethodDetailsBancontact = typeof SetupAttemptPaymentMethodDetailsBancontact.Type
