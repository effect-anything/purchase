import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ListResourceCheckout = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Checkout, any, any> => Models.Checkout as Schema.Schema<Models.Checkout, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.Pagination, any, any> => Models.Pagination as Schema.Schema<Models.Pagination, any, any>
  )
})
export type ListResourceCheckout = typeof ListResourceCheckout.Type
