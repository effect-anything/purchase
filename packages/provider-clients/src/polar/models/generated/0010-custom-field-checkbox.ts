import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomFieldCheckbox = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  type: Schema.String,
  slug: Schema.String,
  name: Schema.String,
  organization_id: Schema.String,
  properties: Schema.suspend((): typeof Models.CustomFieldCheckboxProperties => Models.CustomFieldCheckboxProperties),
})
export type CustomFieldCheckbox = typeof CustomFieldCheckbox.Type
