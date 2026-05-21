import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerListEntity = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerEntity, any, any> =>
        Models.CustomerEntity as Schema.Schema<Models.CustomerEntity, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.PaginationEntity, any, any> =>
      Models.PaginationEntity as Schema.Schema<Models.PaginationEntity, any, any>
  )
})
export type CustomerListEntity = typeof CustomerListEntity.Type
