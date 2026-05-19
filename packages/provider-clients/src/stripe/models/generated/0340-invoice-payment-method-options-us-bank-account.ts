import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsUsBankAccount = Schema.Struct({
  financial_connections: Schema.optional(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions => Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions)),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits")),
})
export type InvoicePaymentMethodOptionsUsBankAccount = typeof InvoicePaymentMethodOptionsUsBankAccount.Type
