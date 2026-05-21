import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingTransactionFleetData = Schema.Struct({
  cardholder_prompt_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionFleetCardholderPromptData, any, any> =>
        Models.IssuingTransactionFleetCardholderPromptData as Schema.Schema<
          Models.IssuingTransactionFleetCardholderPromptData,
          any,
          any
        >
    )
  ),
  purchase_type: Schema.NullOr(Schema.String),
  reported_breakdown: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionFleetReportedBreakdown, any, any> =>
        Models.IssuingTransactionFleetReportedBreakdown as Schema.Schema<
          Models.IssuingTransactionFleetReportedBreakdown,
          any,
          any
        >
    )
  ),
  service_type: Schema.NullOr(Schema.String)
})
export type IssuingTransactionFleetData = typeof IssuingTransactionFleetData.Type
