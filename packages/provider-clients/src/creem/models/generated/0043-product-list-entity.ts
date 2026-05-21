import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.ProductEntity> => Models.ProductEntity)),
  pagination: Schema.suspend((): Schema.Schema<Models.PaginationEntity> => Models.PaginationEntity)
})
export type ProductListEntity = typeof ProductListEntity.Type
