import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingAuthorizationFleetReportedBreakdown = Schema.Struct({
  fuel: Schema.NullOr(Schema.suspend((): typeof Models.IssuingAuthorizationFleetFuelPriceData => Models.IssuingAuthorizationFleetFuelPriceData)),
  non_fuel: Schema.NullOr(Schema.suspend((): typeof Models.IssuingAuthorizationFleetNonFuelPriceData => Models.IssuingAuthorizationFleetNonFuelPriceData)),
  tax: Schema.NullOr(Schema.suspend((): typeof Models.IssuingAuthorizationFleetTaxData => Models.IssuingAuthorizationFleetTaxData)),
})
export type IssuingAuthorizationFleetReportedBreakdown = typeof IssuingAuthorizationFleetReportedBreakdown.Type
