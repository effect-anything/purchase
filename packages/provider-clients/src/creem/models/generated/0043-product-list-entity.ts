import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.ProductEntity)),
  pagination: Schema.suspend(() => Models.PaginationEntity),
})
export type ProductListEntity = typeof ProductListEntity.Type
