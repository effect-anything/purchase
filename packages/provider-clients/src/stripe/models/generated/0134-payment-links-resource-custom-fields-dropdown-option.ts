import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomFieldsDropdownOption = Schema.Struct({
  label: Schema.String,
  value: Schema.String
})
export type PaymentLinksResourceCustomFieldsDropdownOption = typeof PaymentLinksResourceCustomFieldsDropdownOption.Type
