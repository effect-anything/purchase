import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductListEntity = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.ProductEntity, any, any> =>
        Models.ProductEntity as Schema.Schema<Models.ProductEntity, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.PaginationEntity, any, any> =>
      Models.PaginationEntity as Schema.Schema<Models.PaginationEntity, any, any>
  )
})
export type ProductListEntity = typeof ProductListEntity.Type
