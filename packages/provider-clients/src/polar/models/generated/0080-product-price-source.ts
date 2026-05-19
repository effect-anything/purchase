import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceSource = Schema.Literal("catalog", "ad_hoc")
export type ProductPriceSource = typeof ProductPriceSource.Type
