import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PriceTrialDuration = Schema.Struct({
  interval: Schema.suspend(() => Models.DurationInterval),
  frequency: Schema.Number,
  requires_payment_method: Schema.suspend(() => Models.PriceRequiresPaymentMethod),
})
export type PriceTrialDuration = typeof PriceTrialDuration.Type
