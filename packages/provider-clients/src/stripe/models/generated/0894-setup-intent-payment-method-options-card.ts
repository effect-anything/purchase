import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsCard = Schema.Struct({
  mandate_options: Schema.NullOr(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsCardMandateOptions => Models.SetupIntentPaymentMethodOptionsCardMandateOptions)),
  network: Schema.NullOr(Schema.Literal("amex", "cartes_bancaires", "diners", "discover", "eftpos_au", "girocard", "interac", "jcb", "link", "mastercard", "unionpay", "unknown", "visa")),
  request_three_d_secure: Schema.NullOr(Schema.Literal("any", "automatic", "challenge")),
})
export type SetupIntentPaymentMethodOptionsCard = typeof SetupIntentPaymentMethodOptionsCard.Type
