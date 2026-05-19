import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PriceTrialDurationCreate = Schema.Struct({
  interval: Schema.suspend(() => Models.DurationInterval),
  frequency: Schema.Number,
  requires_payment_method: Schema.optional(Schema.suspend(() => Models.PriceRequiresPaymentMethod)),
})
export type PriceTrialDurationCreate = typeof PriceTrialDurationCreate.Type
