import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.CustomerEntity> => Models.CustomerEntity)),
  pagination: Schema.suspend((): Schema.Schema<Models.PaginationEntity> => Models.PaginationEntity)
})
export type CustomerListEntity = typeof CustomerListEntity.Type
