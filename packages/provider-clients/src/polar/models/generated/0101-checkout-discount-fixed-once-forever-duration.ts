import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutDiscountFixedOnceForeverDuration = Schema.Struct({
  duration: Schema.suspend((): typeof Models.DiscountDuration => Models.DiscountDuration),
  type: Schema.suspend((): typeof Models.DiscountType => Models.DiscountType),
  amount: Schema.Number,
  currency: Schema.String,
  amounts: Schema.Record({ key: Schema.String, value: Schema.Number }),
  id: Schema.String,
  name: Schema.String,
  code: Schema.NullOr(Schema.String),
})
export type CheckoutDiscountFixedOnceForeverDuration = typeof CheckoutDiscountFixedOnceForeverDuration.Type
