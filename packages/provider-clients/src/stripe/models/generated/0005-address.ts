import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Address = Schema.Struct({
  city: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  line1: Schema.NullOr(Schema.String),
  line2: Schema.NullOr(Schema.String),
  postal_code: Schema.NullOr(Schema.String),
  state: Schema.NullOr(Schema.String),
})
export type Address = typeof Address.Type
