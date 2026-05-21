import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductResponse = Schema.Struct({
  data: Schema.suspend((): Schema.Schema<Models.ProductResource> => Models.ProductResource),
  links: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiLinks> => Models.JsonApiLinks)),
  meta: Schema.optional(Schema.suspend((): Schema.Schema<Models.JsonApiMeta> => Models.JsonApiMeta))
})
export type ProductResponse = typeof ProductResponse.Type
