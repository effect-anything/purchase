import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomFieldsDropdown = Schema.Struct({
  default_value: Schema.NullOr(Schema.String),
  options: Schema.Array(Schema.suspend((): typeof Models.PaymentLinksResourceCustomFieldsDropdownOption => Models.PaymentLinksResourceCustomFieldsDropdownOption)),
})
export type PaymentLinksResourceCustomFieldsDropdown = typeof PaymentLinksResourceCustomFieldsDropdown.Type
