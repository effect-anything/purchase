import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsPayto = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceMandateOptionsPayto, any, any> =>
        Models.InvoiceMandateOptionsPayto as Schema.Schema<Models.InvoiceMandateOptionsPayto, any, any>
    )
  )
})
export type InvoicePaymentMethodOptionsPayto = typeof InvoicePaymentMethodOptionsPayto.Type
