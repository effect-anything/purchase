import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Customer = Schema.Struct({
  customer_id: Schema.String,
  email: Schema.String,
  name: Schema.optional(Schema.String),
  phone_number: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.suspend(() => Models.Metadata)),
})
export type Customer = typeof Customer.Type
