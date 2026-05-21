import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DiscountListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
    )
  ),
  total: Schema.optional(Schema.Number)
})
export type DiscountListResponse = typeof DiscountListResponse.Type
