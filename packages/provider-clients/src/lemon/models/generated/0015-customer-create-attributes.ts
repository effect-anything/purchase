import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerCreateAttributes = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  city: Schema.optional(Schema.String),
  region: Schema.optional(Schema.String),
  country: Schema.optional(Schema.String),
})
export type CustomerCreateAttributes = typeof CustomerCreateAttributes.Type
