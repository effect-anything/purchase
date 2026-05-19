import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsCard = Schema.Struct({
  installments: Schema.optional(Schema.suspend((): typeof Models.InvoiceInstallmentsCard => Models.InvoiceInstallmentsCard)),
  request_three_d_secure: Schema.NullOr(Schema.Literal("any", "automatic", "challenge")),
})
export type InvoicePaymentMethodOptionsCard = typeof InvoicePaymentMethodOptionsCard.Type
