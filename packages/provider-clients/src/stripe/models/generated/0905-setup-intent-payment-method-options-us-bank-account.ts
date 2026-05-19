import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsUsBankAccount = Schema.Struct({
  financial_connections: Schema.optional(Schema.suspend((): typeof Models.LinkedAccountOptionsCommon => Models.LinkedAccountOptionsCommon)),
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodOptionsUsBankAccountMandateOptions => Models.PaymentMethodOptionsUsBankAccountMandateOptions)),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits")),
})
export type SetupIntentPaymentMethodOptionsUsBankAccount = typeof SetupIntentPaymentMethodOptionsUsBankAccount.Type
