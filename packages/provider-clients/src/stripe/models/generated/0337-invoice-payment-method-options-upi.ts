import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsUpi = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsMandateOptionsUpi, any, any> =>
        Models.InvoicePaymentMethodOptionsMandateOptionsUpi as Schema.Schema<
          Models.InvoicePaymentMethodOptionsMandateOptionsUpi,
          any,
          any
        >
    )
  )
})
export type InvoicePaymentMethodOptionsUpi = typeof InvoicePaymentMethodOptionsUpi.Type
