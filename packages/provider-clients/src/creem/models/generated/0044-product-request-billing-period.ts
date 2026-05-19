import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductRequestBillingPeriod = Schema.Literal("once", "every-month", "every-three-months", "every-six-months", "every-year")
export type ProductRequestBillingPeriod = typeof ProductRequestBillingPeriod.Type
