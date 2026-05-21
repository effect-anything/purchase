import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomFieldDate = Schema.Struct({
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
    (): Schema.Schema<Models.CustomFieldDateProperties, any, any> =>
      Models.CustomFieldDateProperties as Schema.Schema<Models.CustomFieldDateProperties, any, any>
  )
})
export type CustomFieldDate = typeof CustomFieldDate.Type
