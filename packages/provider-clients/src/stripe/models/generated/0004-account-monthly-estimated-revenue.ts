import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountMonthlyEstimatedRevenue = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String
})
export type AccountMonthlyEstimatedRevenue = typeof AccountMonthlyEstimatedRevenue.Type
