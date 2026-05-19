import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ListResourceProduct = Schema.Struct({
  items: Schema.Array(Schema.suspend((): typeof Models.Product => Models.Product)),
  pagination: Schema.suspend((): typeof Models.Pagination => Models.Pagination),
})
export type ListResourceProduct = typeof ListResourceProduct.Type
