import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoiceSettingSubscriptionScheduleSetting = Schema.Struct({
  account_tax_ids: Schema.NullOr(Schema.Array(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TaxId => Models.TaxId), Schema.suspend((): typeof Models.DeletedTaxId => Models.DeletedTaxId)))),
  days_until_due: Schema.NullOr(Schema.Number),
  issuer: Schema.suspend((): typeof Models.ConnectAccountReference => Models.ConnectAccountReference),
})
export type InvoiceSettingSubscriptionScheduleSetting = typeof InvoiceSettingSubscriptionScheduleSetting.Type
