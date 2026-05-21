import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateDiscount = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.DiscountId, any, any> => Models.DiscountId as Schema.Schema<Models.DiscountId, any, any>
  ),
  effective_from: Schema.suspend(
    (): Schema.Schema<Models.EffectiveFrom, any, any> =>
      Models.EffectiveFrom as Schema.Schema<Models.EffectiveFrom, any, any>
  )
})
export type SubscriptionUpdateDiscount = typeof SubscriptionUpdateDiscount.Type
