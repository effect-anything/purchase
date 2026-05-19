import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductStatus = Schema.Literal("draft", "published")
export type ProductStatus = typeof ProductStatus.Type
