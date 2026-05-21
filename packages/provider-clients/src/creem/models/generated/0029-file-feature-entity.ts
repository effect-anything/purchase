import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const FileFeatureEntity = Schema.Struct({
  files: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.FeatureFileEntity, any, any> =>
        Models.FeatureFileEntity as Schema.Schema<Models.FeatureFileEntity, any, any>
    )
  )
})
export type FileFeatureEntity = typeof FileFeatureEntity.Type
