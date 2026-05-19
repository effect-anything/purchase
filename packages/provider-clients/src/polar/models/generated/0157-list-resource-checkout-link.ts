import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ListResourceCheckoutLink = Schema.Struct({
  items: Schema.Array(Schema.suspend((): typeof Models.CheckoutLink => Models.CheckoutLink)),
  pagination: Schema.suspend((): typeof Models.Pagination => Models.Pagination),
})
export type ListResourceCheckoutLink = typeof ListResourceCheckoutLink.Type
