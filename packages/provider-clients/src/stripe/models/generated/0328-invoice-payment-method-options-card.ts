import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsCard = Schema.Struct({
  installments: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceInstallmentsCard, any, any> =>
        Models.InvoiceInstallmentsCard as Schema.Schema<Models.InvoiceInstallmentsCard, any, any>
    )
  ),
  request_three_d_secure: Schema.NullOr(Schema.Literal("any", "automatic", "challenge"))
})
export type InvoicePaymentMethodOptionsCard = typeof InvoicePaymentMethodOptionsCard.Type
