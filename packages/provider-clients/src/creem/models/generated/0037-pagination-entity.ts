import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaginationEntity = Schema.Struct({
  total_records: Schema.Number,
  total_pages: Schema.Number,
  current_page: Schema.Number,
  next_page: Schema.NullOr(Schema.Number),
  prev_page: Schema.NullOr(Schema.Number),
})
export type PaginationEntity = typeof PaginationEntity.Type
