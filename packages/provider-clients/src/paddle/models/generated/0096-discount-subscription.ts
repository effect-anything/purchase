import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DiscountSubscription = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.DiscountId, any, any> => Models.DiscountId as Schema.Schema<Models.DiscountId, any, any>
  ),
  starts_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  ),
  ends_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  )
})
export type DiscountSubscription = typeof DiscountSubscription.Type
