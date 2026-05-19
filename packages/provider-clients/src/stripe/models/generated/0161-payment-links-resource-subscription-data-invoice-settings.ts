import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceSubscriptionDataInvoiceSettings = Schema.Struct({
  issuer: Schema.suspend((): typeof Models.ConnectAccountReference => Models.ConnectAccountReference),
})
export type PaymentLinksResourceSubscriptionDataInvoiceSettings = typeof PaymentLinksResourceSubscriptionDataInvoiceSettings.Type
