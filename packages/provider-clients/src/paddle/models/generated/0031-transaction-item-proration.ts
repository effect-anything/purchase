import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItemProration = Schema.Struct({
  rate: Schema.String,
  billing_period: Schema.suspend((): Schema.Schema<Models.TimePeriod> => Models.TimePeriod)
})
export type TransactionItemProration = typeof TransactionItemProration.Type
