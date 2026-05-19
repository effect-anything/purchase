import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PlatformEarningFeeSource = Schema.Struct({
  charge: Schema.optional(Schema.String),
  payout: Schema.optional(Schema.String),
  type: Schema.Literal("charge", "payout"),
})
export type PlatformEarningFeeSource = typeof PlatformEarningFeeSource.Type
