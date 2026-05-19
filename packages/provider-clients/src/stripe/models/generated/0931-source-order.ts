import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceOrder = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  email: Schema.optional(Schema.String),
  items: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.SourceOrderItem => Models.SourceOrderItem))),
  shipping: Schema.optional(Schema.suspend((): typeof Models.Shipping => Models.Shipping)),
})
export type SourceOrder = typeof SourceOrder.Type
