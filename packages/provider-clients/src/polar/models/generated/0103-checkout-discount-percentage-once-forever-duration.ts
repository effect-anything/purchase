import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutDiscountPercentageOnceForeverDuration = Schema.Struct({
  duration: Schema.suspend((): typeof Models.DiscountDuration => Models.DiscountDuration),
  type: Schema.suspend((): typeof Models.DiscountType => Models.DiscountType),
  basis_points: Schema.Number,
  id: Schema.String,
  name: Schema.String,
  code: Schema.NullOr(Schema.String),
})
export type CheckoutDiscountPercentageOnceForeverDuration = typeof CheckoutDiscountPercentageOnceForeverDuration.Type
