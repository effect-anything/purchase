import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ListResourceProduct = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Product, any, any> => Models.Product as Schema.Schema<Models.Product, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.Pagination, any, any> => Models.Pagination as Schema.Schema<Models.Pagination, any, any>
  )
})
export type ListResourceProduct = typeof ListResourceProduct.Type
