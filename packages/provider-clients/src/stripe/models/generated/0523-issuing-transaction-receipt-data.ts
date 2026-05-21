import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingTransactionReceiptData = Schema.Struct({
  description: Schema.NullOr(Schema.String),
  quantity: Schema.NullOr(Schema.Number),
  total: Schema.NullOr(Schema.Number),
  unit_cost: Schema.NullOr(Schema.Number)
})
export type IssuingTransactionReceiptData = typeof IssuingTransactionReceiptData.Type
