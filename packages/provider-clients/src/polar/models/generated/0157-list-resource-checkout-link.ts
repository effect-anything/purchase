import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ListResourceCheckoutLink = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutLink, any, any> =>
        Models.CheckoutLink as Schema.Schema<Models.CheckoutLink, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.Pagination, any, any> => Models.Pagination as Schema.Schema<Models.Pagination, any, any>
  )
})
export type ListResourceCheckoutLink = typeof ListResourceCheckoutLink.Type
