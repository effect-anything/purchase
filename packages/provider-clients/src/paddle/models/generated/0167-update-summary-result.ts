import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UpdateSummaryResult = Schema.Struct({
  action: Schema.suspend(
    (): Schema.Schema<Models.UpdateSummaryResultAction, any, any> =>
      Models.UpdateSummaryResultAction as Schema.Schema<Models.UpdateSummaryResultAction, any, any>
  ),
  amount: Schema.String,
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCode, any, any> =>
      Models.CurrencyCode as Schema.Schema<Models.CurrencyCode, any, any>
  )
})
export type UpdateSummaryResult = typeof UpdateSummaryResult.Type
