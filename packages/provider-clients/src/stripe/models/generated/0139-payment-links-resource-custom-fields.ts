import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomFields = Schema.Struct({
  dropdown: Schema.optional(Schema.suspend((): typeof Models.PaymentLinksResourceCustomFieldsDropdown => Models.PaymentLinksResourceCustomFieldsDropdown)),
  key: Schema.String,
  label: Schema.suspend((): typeof Models.PaymentLinksResourceCustomFieldsLabel => Models.PaymentLinksResourceCustomFieldsLabel),
  numeric: Schema.optional(Schema.suspend((): typeof Models.PaymentLinksResourceCustomFieldsNumeric => Models.PaymentLinksResourceCustomFieldsNumeric)),
  optional: Schema.Boolean,
  text: Schema.optional(Schema.suspend((): typeof Models.PaymentLinksResourceCustomFieldsText => Models.PaymentLinksResourceCustomFieldsText)),
  type: Schema.Literal("dropdown", "numeric", "text"),
})
export type PaymentLinksResourceCustomFields = typeof PaymentLinksResourceCustomFields.Type
