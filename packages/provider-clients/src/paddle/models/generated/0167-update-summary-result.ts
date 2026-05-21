import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UpdateSummaryResult = Schema.Struct({
  action: Schema.suspend((): Schema.Schema<Models.UpdateSummaryResultAction> => Models.UpdateSummaryResultAction),
  amount: Schema.String,
  currency_code: Schema.suspend((): Schema.Schema<Models.CurrencyCode> => Models.CurrencyCode)
})
export type UpdateSummaryResult = typeof UpdateSummaryResult.Type
