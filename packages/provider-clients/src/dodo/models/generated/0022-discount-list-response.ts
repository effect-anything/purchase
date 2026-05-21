import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DiscountListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.Discount> => Models.Discount)),
  total: Schema.optional(Schema.Number)
})
export type DiscountListResponse = typeof DiscountListResponse.Type
