import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoiceSettingCustomerRenderingOptions = Schema.Struct({
  amount_tax_display: Schema.NullOr(Schema.String),
  template: Schema.NullOr(Schema.String),
})
export type InvoiceSettingCustomerRenderingOptions = typeof InvoiceSettingCustomerRenderingOptions.Type
