import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Totals = Schema.Struct({
  subtotal: Schema.String,
  discount: Schema.String,
  tax: Schema.String,
  total: Schema.String,
})
export type Totals = typeof Totals.Type
