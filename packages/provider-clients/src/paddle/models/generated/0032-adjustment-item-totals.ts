import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AdjustmentItemTotals = Schema.Struct({
  subtotal: Schema.String,
  tax: Schema.String,
  total: Schema.String
})
export type AdjustmentItemTotals = typeof AdjustmentItemTotals.Type
