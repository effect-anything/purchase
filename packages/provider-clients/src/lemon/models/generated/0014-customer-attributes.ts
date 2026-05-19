import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerAttributes = Schema.Struct({
  store_id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
  status: Schema.optional(Schema.String),
  city: Schema.optional(Schema.NullOr(Schema.String)),
  region: Schema.optional(Schema.NullOr(Schema.String)),
  country: Schema.optional(Schema.NullOr(Schema.String)),
  created_at: Schema.String,
  updated_at: Schema.String,
  test_mode: Schema.Boolean,
})
export type CustomerAttributes = typeof CustomerAttributes.Type
