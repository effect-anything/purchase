import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ListResourceCheckout = Schema.Struct({
  items: Schema.Array(Schema.suspend((): typeof Models.Checkout => Models.Checkout)),
  pagination: Schema.suspend((): typeof Models.Pagination => Models.Pagination),
})
export type ListResourceCheckout = typeof ListResourceCheckout.Type
