import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionMeter = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  consumed_units: Schema.Number,
  credited_units: Schema.Number,
  amount: Schema.Number,
  meter_id: Schema.String,
  meter: Schema.suspend((): typeof Models.Meter => Models.Meter),
})
export type SubscriptionMeter = typeof SubscriptionMeter.Type
