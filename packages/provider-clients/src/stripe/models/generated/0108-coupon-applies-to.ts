import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CouponAppliesTo = Schema.Struct({
  products: Schema.Array(Schema.String),
})
export type CouponAppliesTo = typeof CouponAppliesTo.Type
