import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoiceSettingCustomField = Schema.Struct({
  name: Schema.String,
  value: Schema.String
})
export type InvoiceSettingCustomField = typeof InvoiceSettingCustomField.Type
