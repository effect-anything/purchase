import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductSortProperty = Schema.Literal("created_at", "-created_at", "name", "-name", "price_amount_type", "-price_amount_type", "price_amount", "-price_amount")
export type ProductSortProperty = typeof ProductSortProperty.Type
