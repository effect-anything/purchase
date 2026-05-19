import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsAcssDebitMandateOptions = Schema.Struct({
  transaction_type: Schema.NullOr(Schema.Literal("business", "personal")),
})
export type InvoicePaymentMethodOptionsAcssDebitMandateOptions = typeof InvoicePaymentMethodOptionsAcssDebitMandateOptions.Type
