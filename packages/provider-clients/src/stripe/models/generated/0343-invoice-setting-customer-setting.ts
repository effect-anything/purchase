import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoiceSettingCustomerSetting = Schema.Struct({
  custom_fields: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.InvoiceSettingCustomField => Models.InvoiceSettingCustomField))),
  default_payment_method: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentMethod => Models.PaymentMethod))),
  footer: Schema.NullOr(Schema.String),
  rendering_options: Schema.NullOr(Schema.suspend((): typeof Models.InvoiceSettingCustomerRenderingOptions => Models.InvoiceSettingCustomerRenderingOptions)),
})
export type InvoiceSettingCustomerSetting = typeof InvoiceSettingCustomerSetting.Type
