import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const OrderListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.OrderEntity> => Models.OrderEntity)),
  pagination: Schema.suspend((): Schema.Schema<Models.PaginationEntity> => Models.PaginationEntity)
})
export type OrderListEntity = typeof OrderListEntity.Type
