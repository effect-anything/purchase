import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerStateSubscriptionMeter = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  consumed_units: Schema.Number,
  credited_units: Schema.Number,
  amount: Schema.Number,
  meter_id: Schema.String,
})
export type CustomerStateSubscriptionMeter = typeof CustomerStateSubscriptionMeter.Type
