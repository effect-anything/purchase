import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateDiscount = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.DiscountId> => Models.DiscountId),
  effective_from: Schema.suspend((): Schema.Schema<Models.EffectiveFrom> => Models.EffectiveFrom)
})
export type SubscriptionUpdateDiscount = typeof SubscriptionUpdateDiscount.Type
