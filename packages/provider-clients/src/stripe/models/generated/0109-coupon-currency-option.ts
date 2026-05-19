import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CouponCurrencyOption = Schema.Struct({
  amount_off: Schema.Number,
})
export type CouponCurrencyOption = typeof CouponCurrencyOption.Type
