import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransactionFleetReportedBreakdown = Schema.Struct({
  fuel: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionFleetFuelPriceData => Models.IssuingTransactionFleetFuelPriceData)),
  non_fuel: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionFleetNonFuelPriceData => Models.IssuingTransactionFleetNonFuelPriceData)),
  tax: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionFleetTaxData => Models.IssuingTransactionFleetTaxData)),
})
export type IssuingTransactionFleetReportedBreakdown = typeof IssuingTransactionFleetReportedBreakdown.Type
