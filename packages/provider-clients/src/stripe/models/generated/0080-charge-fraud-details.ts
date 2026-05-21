import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ChargeFraudDetails = Schema.Struct({
  stripe_report: Schema.optional(Schema.String),
  user_report: Schema.optional(Schema.String)
})
export type ChargeFraudDetails = typeof ChargeFraudDetails.Type
