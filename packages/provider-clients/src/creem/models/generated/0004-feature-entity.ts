import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FeatureEntity = Schema.Struct({
  id: Schema.String,
  type: Schema.suspend(() => Models.ProductFeatureType),
  description: Schema.String,
})
export type FeatureEntity = typeof FeatureEntity.Type
