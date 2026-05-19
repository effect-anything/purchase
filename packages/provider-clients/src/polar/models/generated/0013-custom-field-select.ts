import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomFieldSelect = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  type: Schema.String,
  slug: Schema.String,
  name: Schema.String,
  organization_id: Schema.String,
  properties: Schema.suspend((): typeof Models.CustomFieldSelectProperties => Models.CustomFieldSelectProperties),
})
export type CustomFieldSelect = typeof CustomFieldSelect.Type
