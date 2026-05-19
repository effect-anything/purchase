import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductBillingPeriod = Schema.Literal("every-month", "every-three-months", "every-six-months", "every-year", "once")
export type ProductBillingPeriod = typeof ProductBillingPeriod.Type
