import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Fee = Schema.Struct({
  amount: Schema.Number,
  application: Schema.NullOr(Schema.String),
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  type: Schema.String
})
export type Fee = typeof Fee.Type
