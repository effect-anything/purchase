import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ShippingRateCurrencyOption = Schema.Struct({
  amount: Schema.Number,
  tax_behavior: Schema.Literal("exclusive", "inclusive", "unspecified"),
})
export type ShippingRateCurrencyOption = typeof ShippingRateCurrencyOption.Type
