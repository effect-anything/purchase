import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ListResourceOrder = Schema.Struct({
  items: Schema.Array(
    Schema.suspend((): Schema.Schema<Models.Order, any, any> => Models.Order as Schema.Schema<Models.Order, any, any>)
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.Pagination, any, any> => Models.Pagination as Schema.Schema<Models.Pagination, any, any>
  )
})
export type ListResourceOrder = typeof ListResourceOrder.Type
