import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomFields = Schema.Struct({
  dropdown: Schema.optional(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCustomFieldsDropdown => Models.PaymentPagesCheckoutSessionCustomFieldsDropdown)),
  key: Schema.String,
  label: Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCustomFieldsLabel => Models.PaymentPagesCheckoutSessionCustomFieldsLabel),
  numeric: Schema.optional(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCustomFieldsNumeric => Models.PaymentPagesCheckoutSessionCustomFieldsNumeric)),
  optional: Schema.Boolean,
  text: Schema.optional(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCustomFieldsText => Models.PaymentPagesCheckoutSessionCustomFieldsText)),
  type: Schema.Literal("dropdown", "numeric", "text"),
})
export type PaymentPagesCheckoutSessionCustomFields = typeof PaymentPagesCheckoutSessionCustomFields.Type
