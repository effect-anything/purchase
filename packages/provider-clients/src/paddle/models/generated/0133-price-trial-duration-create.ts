import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PriceTrialDurationCreate = Schema.Struct({
  interval: Schema.suspend(
    (): Schema.Schema<Models.DurationInterval, any, any> =>
      Models.DurationInterval as Schema.Schema<Models.DurationInterval, any, any>
  ),
  frequency: Schema.Number,
  requires_payment_method: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PriceRequiresPaymentMethod, any, any> =>
        Models.PriceRequiresPaymentMethod as Schema.Schema<Models.PriceRequiresPaymentMethod, any, any>
    )
  )
})
export type PriceTrialDurationCreate = typeof PriceTrialDurationCreate.Type
