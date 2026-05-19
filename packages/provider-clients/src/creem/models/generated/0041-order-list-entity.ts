import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const OrderListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.OrderEntity)),
  pagination: Schema.suspend(() => Models.PaginationEntity),
})
export type OrderListEntity = typeof OrderListEntity.Type
