import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ListResourceCustomer = Schema.Struct({
  items: Schema.Array(Schema.suspend((): typeof Models.Customer => Models.Customer)),
  pagination: Schema.suspend((): typeof Models.Pagination => Models.Pagination),
})
export type ListResourceCustomer = typeof ListResourceCustomer.Type
