import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingTransactionFleetCardholderPromptData = Schema.Struct({
  driver_id: Schema.NullOr(Schema.String),
  odometer: Schema.NullOr(Schema.Number),
  unspecified_id: Schema.NullOr(Schema.String),
  user_id: Schema.NullOr(Schema.String),
  vehicle_number: Schema.NullOr(Schema.String)
})
export type IssuingTransactionFleetCardholderPromptData = typeof IssuingTransactionFleetCardholderPromptData.Type
