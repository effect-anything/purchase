import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutDiscountPercentageRepeatDuration = Schema.Struct({
  duration: Schema.suspend((): typeof Models.DiscountDuration => Models.DiscountDuration),
  duration_in_months: Schema.Number,
  type: Schema.suspend((): typeof Models.DiscountType => Models.DiscountType),
  basis_points: Schema.Number,
  id: Schema.String,
  name: Schema.String,
  code: Schema.NullOr(Schema.String),
})
export type CheckoutDiscountPercentageRepeatDuration = typeof CheckoutDiscountPercentageRepeatDuration.Type
