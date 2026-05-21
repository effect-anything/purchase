import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitFeatureFlag = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  type: Schema.String,
  description: Schema.String,
  selectable: Schema.Boolean,
  deletable: Schema.Boolean,
  is_deleted: Schema.Boolean,
  organization_id: Schema.String,
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  properties: Schema.suspend(
    (): Schema.Schema<Models.BenefitFeatureFlagProperties, any, any> =>
      Models.BenefitFeatureFlagProperties as Schema.Schema<Models.BenefitFeatureFlagProperties, any, any>
  )
})
export type BenefitFeatureFlag = typeof BenefitFeatureFlag.Type
