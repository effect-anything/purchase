import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Pagination = Schema.Struct({
  total_count: Schema.Number,
  max_page: Schema.Number,
})
export type Pagination = typeof Pagination.Type
