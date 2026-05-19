import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductListResponse = Schema.Struct({
  data: Schema.Array(Schema.suspend(() => Models.ProductResource)),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type ProductListResponse = typeof ProductListResponse.Type
