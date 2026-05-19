import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransactionFleetData = Schema.Struct({
  cardholder_prompt_data: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionFleetCardholderPromptData => Models.IssuingTransactionFleetCardholderPromptData)),
  purchase_type: Schema.NullOr(Schema.String),
  reported_breakdown: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionFleetReportedBreakdown => Models.IssuingTransactionFleetReportedBreakdown)),
  service_type: Schema.NullOr(Schema.String),
})
export type IssuingTransactionFleetData = typeof IssuingTransactionFleetData.Type
