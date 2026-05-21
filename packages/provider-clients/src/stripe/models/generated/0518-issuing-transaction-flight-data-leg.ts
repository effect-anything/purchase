import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingTransactionFlightDataLeg = Schema.Struct({
  arrival_airport_code: Schema.NullOr(Schema.String),
  carrier: Schema.NullOr(Schema.String),
  departure_airport_code: Schema.NullOr(Schema.String),
  flight_number: Schema.NullOr(Schema.String),
  service_class: Schema.NullOr(Schema.String),
  stopover_allowed: Schema.NullOr(Schema.Boolean)
})
export type IssuingTransactionFlightDataLeg = typeof IssuingTransactionFlightDataLeg.Type
