import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomFieldsDropdown = Schema.Struct({
  default_value: Schema.NullOr(Schema.String),
  options: Schema.Array(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCustomFieldsOption => Models.PaymentPagesCheckoutSessionCustomFieldsOption)),
  value: Schema.NullOr(Schema.String),
})
export type PaymentPagesCheckoutSessionCustomFieldsDropdown = typeof PaymentPagesCheckoutSessionCustomFieldsDropdown.Type
