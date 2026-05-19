import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomFieldsNumeric = Schema.Struct({
  default_value: Schema.NullOr(Schema.String),
  maximum_length: Schema.NullOr(Schema.Number),
  minimum_length: Schema.NullOr(Schema.Number),
  value: Schema.NullOr(Schema.String),
})
export type PaymentPagesCheckoutSessionCustomFieldsNumeric = typeof PaymentPagesCheckoutSessionCustomFieldsNumeric.Type
