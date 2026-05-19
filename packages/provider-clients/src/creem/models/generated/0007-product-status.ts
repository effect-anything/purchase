import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductStatus = Schema.Literal("active", "archived")
export type ProductStatus = typeof ProductStatus.Type
