import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomFieldsNumeric = Schema.Struct({
  default_value: Schema.NullOr(Schema.String),
  maximum_length: Schema.NullOr(Schema.Number),
  minimum_length: Schema.NullOr(Schema.Number),
})
export type PaymentLinksResourceCustomFieldsNumeric = typeof PaymentLinksResourceCustomFieldsNumeric.Type
