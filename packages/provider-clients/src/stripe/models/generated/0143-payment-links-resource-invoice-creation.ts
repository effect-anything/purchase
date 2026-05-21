import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceInvoiceCreation = Schema.Struct({
  enabled: Schema.Boolean,
  invoice_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceInvoiceSettings, any, any> =>
        Models.PaymentLinksResourceInvoiceSettings as Schema.Schema<
          Models.PaymentLinksResourceInvoiceSettings,
          any,
          any
        >
    )
  )
})
export type PaymentLinksResourceInvoiceCreation = typeof PaymentLinksResourceInvoiceCreation.Type
