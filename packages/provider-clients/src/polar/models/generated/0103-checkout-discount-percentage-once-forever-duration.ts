import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutDiscountPercentageOnceForeverDuration = Schema.Struct({
  duration: Schema.suspend(
    (): Schema.Schema<Models.DiscountDuration, any, any> =>
      Models.DiscountDuration as Schema.Schema<Models.DiscountDuration, any, any>
  ),
  type: Schema.suspend(
    (): Schema.Schema<Models.DiscountType, any, any> =>
      Models.DiscountType as Schema.Schema<Models.DiscountType, any, any>
  ),
  basis_points: Schema.Number,
  id: Schema.String,
  name: Schema.String,
  code: Schema.NullOr(Schema.String)
})
export type CheckoutDiscountPercentageOnceForeverDuration = typeof CheckoutDiscountPercentageOnceForeverDuration.Type
