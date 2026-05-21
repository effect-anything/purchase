import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionInvoiceCreation = Schema.Struct({
  enabled: Schema.Boolean,
  invoice_data: Schema.suspend(
    (): Schema.Schema<Models.PaymentPagesCheckoutSessionInvoiceSettings, any, any> =>
      Models.PaymentPagesCheckoutSessionInvoiceSettings as Schema.Schema<
        Models.PaymentPagesCheckoutSessionInvoiceSettings,
        any,
        any
      >
  )
})
export type PaymentPagesCheckoutSessionInvoiceCreation = typeof PaymentPagesCheckoutSessionInvoiceCreation.Type
