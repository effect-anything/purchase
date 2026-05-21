import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingTransactionPurchaseDetails = Schema.Struct({
  fleet: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionFleetData, any, any> =>
        Models.IssuingTransactionFleetData as Schema.Schema<Models.IssuingTransactionFleetData, any, any>
    )
  ),
  flight: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionFlightData, any, any> =>
        Models.IssuingTransactionFlightData as Schema.Schema<Models.IssuingTransactionFlightData, any, any>
    )
  ),
  fuel: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionFuelData, any, any> =>
        Models.IssuingTransactionFuelData as Schema.Schema<Models.IssuingTransactionFuelData, any, any>
    )
  ),
  lodging: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionLodgingData, any, any> =>
        Models.IssuingTransactionLodgingData as Schema.Schema<Models.IssuingTransactionLodgingData, any, any>
    )
  ),
  receipt: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.IssuingTransactionReceiptData, any, any> =>
          Models.IssuingTransactionReceiptData as Schema.Schema<Models.IssuingTransactionReceiptData, any, any>
      )
    )
  ),
  reference: Schema.NullOr(Schema.String)
})
export type IssuingTransactionPurchaseDetails = typeof IssuingTransactionPurchaseDetails.Type
