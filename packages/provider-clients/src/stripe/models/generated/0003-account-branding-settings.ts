import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountBrandingSettings = Schema.Struct({
  icon: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  logo: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.File => Models.File))),
  primary_color: Schema.NullOr(Schema.String),
  secondary_color: Schema.NullOr(Schema.String),
})
export type AccountBrandingSettings = typeof AccountBrandingSettings.Type
