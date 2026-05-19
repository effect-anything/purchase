import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceOrderItem = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  currency: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  parent: Schema.NullOr(Schema.String),
  quantity: Schema.optional(Schema.Number),
  type: Schema.NullOr(Schema.String),
})
export type SourceOrderItem = typeof SourceOrderItem.Type
