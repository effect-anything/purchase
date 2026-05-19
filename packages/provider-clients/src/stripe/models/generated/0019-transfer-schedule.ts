import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransferSchedule = Schema.Struct({
  delay_days: Schema.Number,
  interval: Schema.String,
  monthly_anchor: Schema.optional(Schema.Number),
  monthly_payout_days: Schema.optional(Schema.Array(Schema.Number)),
  weekly_anchor: Schema.optional(Schema.String),
  weekly_payout_days: Schema.optional(Schema.Array(Schema.Literal("friday", "monday", "thursday", "tuesday", "wednesday"))),
})
export type TransferSchedule = typeof TransferSchedule.Type
