import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductResponse = Schema.Struct({
  data: Schema.suspend(() => Models.ProductResource),
  links: Schema.optional(Schema.suspend(() => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend(() => Models.JsonApiMeta)),
})
export type ProductResponse = typeof ProductResponse.Type
