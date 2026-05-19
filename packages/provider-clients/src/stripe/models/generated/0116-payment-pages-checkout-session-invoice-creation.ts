import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionInvoiceCreation = Schema.Struct({
  enabled: Schema.Boolean,
  invoice_data: Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionInvoiceSettings => Models.PaymentPagesCheckoutSessionInvoiceSettings),
})
export type PaymentPagesCheckoutSessionInvoiceCreation = typeof PaymentPagesCheckoutSessionInvoiceCreation.Type
