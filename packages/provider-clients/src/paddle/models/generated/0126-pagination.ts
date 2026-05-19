import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Pagination = Schema.Struct({
  per_page: Schema.Number,
  next: Schema.String,
  has_more: Schema.Boolean,
  estimated_total: Schema.optional(Schema.Number),
})
export type Pagination = typeof Pagination.Type
