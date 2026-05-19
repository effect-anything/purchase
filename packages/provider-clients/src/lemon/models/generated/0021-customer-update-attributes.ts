import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerUpdateAttributes = Schema.Struct({
  name: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String),
  city: Schema.optional(Schema.String),
  region: Schema.optional(Schema.String),
  country: Schema.optional(Schema.String),
  status: Schema.optional(Schema.Literal("archived")),
})
export type CustomerUpdateAttributes = typeof CustomerUpdateAttributes.Type
