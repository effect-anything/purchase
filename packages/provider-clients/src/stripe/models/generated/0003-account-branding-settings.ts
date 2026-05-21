import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountBrandingSettings = Schema.Struct({
  icon: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  logo: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.File, any, any> => Models.File as Schema.Schema<Models.File, any, any>)
    )
  ),
  primary_color: Schema.NullOr(Schema.String),
  secondary_color: Schema.NullOr(Schema.String)
})
export type AccountBrandingSettings = typeof AccountBrandingSettings.Type
