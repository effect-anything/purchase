import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.Product)),
  total: Schema.optional(Schema.Number),
})
export type ProductListResponse = typeof ProductListResponse.Type
