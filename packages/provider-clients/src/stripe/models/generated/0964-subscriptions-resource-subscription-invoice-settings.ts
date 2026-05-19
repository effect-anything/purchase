import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionsResourceSubscriptionInvoiceSettings = Schema.Struct({
  account_tax_ids: Schema.NullOr(Schema.Array(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TaxId => Models.TaxId), Schema.suspend((): typeof Models.DeletedTaxId => Models.DeletedTaxId)))),
  issuer: Schema.suspend((): typeof Models.ConnectAccountReference => Models.ConnectAccountReference),
})
export type SubscriptionsResourceSubscriptionInvoiceSettings = typeof SubscriptionsResourceSubscriptionInvoiceSettings.Type
