import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerStateMeter = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  meter_id: Schema.String,
  consumed_units: Schema.Number,
  credited_units: Schema.Number,
  balance: Schema.Number
})
export type CustomerStateMeter = typeof CustomerStateMeter.Type
