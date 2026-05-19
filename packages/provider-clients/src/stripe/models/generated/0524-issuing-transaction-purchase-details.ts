import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransactionPurchaseDetails = Schema.Struct({
  fleet: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionFleetData => Models.IssuingTransactionFleetData)),
  flight: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionFlightData => Models.IssuingTransactionFlightData)),
  fuel: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionFuelData => Models.IssuingTransactionFuelData)),
  lodging: Schema.NullOr(Schema.suspend((): typeof Models.IssuingTransactionLodgingData => Models.IssuingTransactionLodgingData)),
  receipt: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.IssuingTransactionReceiptData => Models.IssuingTransactionReceiptData))),
  reference: Schema.NullOr(Schema.String),
})
export type IssuingTransactionPurchaseDetails = typeof IssuingTransactionPurchaseDetails.Type
