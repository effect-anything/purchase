import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionInvoiceSettings = Schema.Struct({
  account_tax_ids: Schema.NullOr(Schema.Array(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TaxId => Models.TaxId), Schema.suspend((): typeof Models.DeletedTaxId => Models.DeletedTaxId)))),
  custom_fields: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.InvoiceSettingCustomField => Models.InvoiceSettingCustomField))),
  description: Schema.NullOr(Schema.String),
  footer: Schema.NullOr(Schema.String),
  issuer: Schema.NullOr(Schema.suspend((): typeof Models.ConnectAccountReference => Models.ConnectAccountReference)),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  rendering_options: Schema.NullOr(Schema.suspend((): typeof Models.InvoiceSettingCheckoutRenderingOptions => Models.InvoiceSettingCheckoutRenderingOptions)),
})
export type PaymentPagesCheckoutSessionInvoiceSettings = typeof PaymentPagesCheckoutSessionInvoiceSettings.Type
