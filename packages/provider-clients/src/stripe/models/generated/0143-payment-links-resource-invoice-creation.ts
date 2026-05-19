import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceInvoiceCreation = Schema.Struct({
  enabled: Schema.Boolean,
  invoice_data: Schema.NullOr(Schema.suspend((): typeof Models.PaymentLinksResourceInvoiceSettings => Models.PaymentLinksResourceInvoiceSettings)),
})
export type PaymentLinksResourceInvoiceCreation = typeof PaymentLinksResourceInvoiceCreation.Type
