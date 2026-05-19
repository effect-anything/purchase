import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsPayto = Schema.Struct({
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.InvoiceMandateOptionsPayto => Models.InvoiceMandateOptionsPayto)),
})
export type InvoicePaymentMethodOptionsPayto = typeof InvoicePaymentMethodOptionsPayto.Type
