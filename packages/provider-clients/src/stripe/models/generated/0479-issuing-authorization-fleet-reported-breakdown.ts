import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingAuthorizationFleetReportedBreakdown = Schema.Struct({
  fuel: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationFleetFuelPriceData, any, any> =>
        Models.IssuingAuthorizationFleetFuelPriceData as Schema.Schema<
          Models.IssuingAuthorizationFleetFuelPriceData,
          any,
          any
        >
    )
  ),
  non_fuel: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationFleetNonFuelPriceData, any, any> =>
        Models.IssuingAuthorizationFleetNonFuelPriceData as Schema.Schema<
          Models.IssuingAuthorizationFleetNonFuelPriceData,
          any,
          any
        >
    )
  ),
  tax: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationFleetTaxData, any, any> =>
        Models.IssuingAuthorizationFleetTaxData as Schema.Schema<Models.IssuingAuthorizationFleetTaxData, any, any>
    )
  )
})
export type IssuingAuthorizationFleetReportedBreakdown = typeof IssuingAuthorizationFleetReportedBreakdown.Type
