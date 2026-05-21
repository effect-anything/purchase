import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderListEntity = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.OrderEntity, any, any> =>
        Models.OrderEntity as Schema.Schema<Models.OrderEntity, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.PaginationEntity, any, any> =>
      Models.PaginationEntity as Schema.Schema<Models.PaginationEntity, any, any>
  )
})
export type OrderListEntity = typeof OrderListEntity.Type
