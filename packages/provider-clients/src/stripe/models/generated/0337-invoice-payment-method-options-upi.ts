import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsUpi = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsMandateOptionsUpi => Models.InvoicePaymentMethodOptionsMandateOptionsUpi)),
})
export type InvoicePaymentMethodOptionsUpi = typeof InvoicePaymentMethodOptionsUpi.Type
