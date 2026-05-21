import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DeletedProductFeature = Schema.Struct({
  deleted: Schema.Literal(true),
  id: Schema.String,
  object: Schema.Literal("product_feature")
})
export type DeletedProductFeature = typeof DeletedProductFeature.Type
