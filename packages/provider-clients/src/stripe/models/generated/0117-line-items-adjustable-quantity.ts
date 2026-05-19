import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LineItemsAdjustableQuantity = Schema.Struct({
  enabled: Schema.Boolean,
  maximum: Schema.NullOr(Schema.Number),
  minimum: Schema.NullOr(Schema.Number),
})
export type LineItemsAdjustableQuantity = typeof LineItemsAdjustableQuantity.Type
