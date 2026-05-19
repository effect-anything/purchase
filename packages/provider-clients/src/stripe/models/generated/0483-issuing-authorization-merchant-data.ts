import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingAuthorizationMerchantData = Schema.Struct({
  category: Schema.String,
  category_code: Schema.String,
  city: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  network_id: Schema.String,
  postal_code: Schema.NullOr(Schema.String),
  state: Schema.NullOr(Schema.String),
  tax_id: Schema.NullOr(Schema.String),
  terminal_id: Schema.NullOr(Schema.String),
  url: Schema.NullOr(Schema.String),
})
export type IssuingAuthorizationMerchantData = typeof IssuingAuthorizationMerchantData.Type
