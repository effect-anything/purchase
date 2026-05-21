import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingTransactionFlightData = Schema.Struct({
  departure_at: Schema.NullOr(Schema.Number),
  passenger_name: Schema.NullOr(Schema.String),
  refundable: Schema.NullOr(Schema.Boolean),
  segments: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.IssuingTransactionFlightDataLeg, any, any> =>
          Models.IssuingTransactionFlightDataLeg as Schema.Schema<Models.IssuingTransactionFlightDataLeg, any, any>
      )
    )
  ),
  travel_agency: Schema.NullOr(Schema.String)
})
export type IssuingTransactionFlightData = typeof IssuingTransactionFlightData.Type
