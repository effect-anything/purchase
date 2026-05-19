import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingAuthorizationFleetData = Schema.Struct({
  cardholder_prompt_data: Schema.NullOr(Schema.suspend((): typeof Models.IssuingAuthorizationFleetCardholderPromptData => Models.IssuingAuthorizationFleetCardholderPromptData)),
  purchase_type: Schema.NullOr(Schema.Literal("fuel_and_non_fuel_purchase", "fuel_purchase", "non_fuel_purchase")),
  reported_breakdown: Schema.NullOr(Schema.suspend((): typeof Models.IssuingAuthorizationFleetReportedBreakdown => Models.IssuingAuthorizationFleetReportedBreakdown)),
  service_type: Schema.NullOr(Schema.Literal("full_service", "non_fuel_transaction", "self_service")),
})
export type IssuingAuthorizationFleetData = typeof IssuingAuthorizationFleetData.Type
