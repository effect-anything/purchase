import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutDiscountFixedRepeatDuration = Schema.Struct({
  duration: Schema.suspend(
    (): Schema.Schema<Models.DiscountDuration, any, any> =>
      Models.DiscountDuration as Schema.Schema<Models.DiscountDuration, any, any>
  ),
  duration_in_months: Schema.Number,
  type: Schema.suspend(
    (): Schema.Schema<Models.DiscountType, any, any> =>
      Models.DiscountType as Schema.Schema<Models.DiscountType, any, any>
  ),
  amount: Schema.Number,
  currency: Schema.String,
  amounts: Schema.Record({ key: Schema.String, value: Schema.Number }),
  id: Schema.String,
  name: Schema.String,
  code: Schema.NullOr(Schema.String)
})
export type CheckoutDiscountFixedRepeatDuration = typeof CheckoutDiscountFixedRepeatDuration.Type
