import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FeatureFileEntity = Schema.Struct({
  id: Schema.String,
  file_name: Schema.String,
  url: Schema.String,
  type: Schema.String,
  size: Schema.Number,
})
export type FeatureFileEntity = typeof FeatureFileEntity.Type
