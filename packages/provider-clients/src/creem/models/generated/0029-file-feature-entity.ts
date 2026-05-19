import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FileFeatureEntity = Schema.Struct({
  files: Schema.Array(Schema.suspend(() => Models.FeatureFileEntity)),
})
export type FileFeatureEntity = typeof FileFeatureEntity.Type
