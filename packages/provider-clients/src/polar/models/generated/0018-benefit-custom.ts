import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitCustom = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  type: Schema.String,
  description: Schema.String,
  selectable: Schema.Boolean,
  deletable: Schema.Boolean,
  is_deleted: Schema.Boolean,
  organization_id: Schema.String,
  metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  properties: Schema.suspend((): typeof Models.BenefitCustomProperties => Models.BenefitCustomProperties),
})
export type BenefitCustom = typeof BenefitCustom.Type
