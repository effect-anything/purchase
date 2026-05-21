import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomFieldText = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
  ),
  type: Schema.String,
  slug: Schema.String,
  name: Schema.String,
  organization_id: Schema.String,
  properties: Schema.suspend(
    (): Schema.Schema<Models.CustomFieldTextProperties, any, any> =>
      Models.CustomFieldTextProperties as Schema.Schema<Models.CustomFieldTextProperties, any, any>
  )
})
export type CustomFieldText = typeof CustomFieldText.Type
