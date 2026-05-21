import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingTransactionFleetReportedBreakdown = Schema.Struct({
  fuel: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionFleetFuelPriceData, any, any> =>
        Models.IssuingTransactionFleetFuelPriceData as Schema.Schema<
          Models.IssuingTransactionFleetFuelPriceData,
          any,
          any
        >
    )
  ),
  non_fuel: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionFleetNonFuelPriceData, any, any> =>
        Models.IssuingTransactionFleetNonFuelPriceData as Schema.Schema<
          Models.IssuingTransactionFleetNonFuelPriceData,
          any,
          any
        >
    )
  ),
  tax: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionFleetTaxData, any, any> =>
        Models.IssuingTransactionFleetTaxData as Schema.Schema<Models.IssuingTransactionFleetTaxData, any, any>
    )
  )
})
export type IssuingTransactionFleetReportedBreakdown = typeof IssuingTransactionFleetReportedBreakdown.Type
