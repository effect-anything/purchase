import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomFieldsText = Schema.Struct({
  default_value: Schema.NullOr(Schema.String),
  maximum_length: Schema.NullOr(Schema.Number),
  minimum_length: Schema.NullOr(Schema.Number),
})
export type PaymentLinksResourceCustomFieldsText = typeof PaymentLinksResourceCustomFieldsText.Type
