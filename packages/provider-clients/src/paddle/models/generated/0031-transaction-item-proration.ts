import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItemProration = Schema.Struct({
  rate: Schema.String,
  billing_period: Schema.suspend(
    (): Schema.Schema<Models.TimePeriod, any, any> => Models.TimePeriod as Schema.Schema<Models.TimePeriod, any, any>
  )
})
export type TransactionItemProration = typeof TransactionItemProration.Type
