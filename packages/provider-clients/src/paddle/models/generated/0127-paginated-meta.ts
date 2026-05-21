import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaginatedMeta = Schema.Struct({
  request_id: Schema.String,
  pagination: Schema.suspend(
    (): Schema.Schema<Models.Pagination, any, any> => Models.Pagination as Schema.Schema<Models.Pagination, any, any>
  )
})
export type PaginatedMeta = typeof PaginatedMeta.Type
