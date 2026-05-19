import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.CustomerEntity)),
  pagination: Schema.suspend(() => Models.PaginationEntity),
})
export type CustomerListEntity = typeof CustomerListEntity.Type
