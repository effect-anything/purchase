import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ListResourceOrder = Schema.Struct({
  items: Schema.Array(Schema.suspend((): typeof Models.Order => Models.Order)),
  pagination: Schema.suspend((): typeof Models.Pagination => Models.Pagination),
})
export type ListResourceOrder = typeof ListResourceOrder.Type
