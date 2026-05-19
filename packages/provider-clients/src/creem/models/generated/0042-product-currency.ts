import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductCurrency = Schema.Literal("EUR", "USD")
export type ProductCurrency = typeof ProductCurrency.Type
