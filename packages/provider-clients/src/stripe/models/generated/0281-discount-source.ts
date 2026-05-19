import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DiscountSource = Schema.Struct({
  coupon: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Coupon => Models.Coupon))),
  type: Schema.Literal("coupon"),
})
export type DiscountSource = typeof DiscountSource.Type
