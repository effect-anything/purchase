import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundItem = Schema.Struct({
  item_id: Schema.String,
  amount: Schema.optional(Schema.NullOr(Schema.Number)),
  tax_inclusive: Schema.optional(Schema.Boolean),
})
export type RefundItem = typeof RefundItem.Type
