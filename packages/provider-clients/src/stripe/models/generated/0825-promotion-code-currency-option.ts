import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PromotionCodeCurrencyOption = Schema.Struct({
  minimum_amount: Schema.Number,
})
export type PromotionCodeCurrencyOption = typeof PromotionCodeCurrencyOption.Type
