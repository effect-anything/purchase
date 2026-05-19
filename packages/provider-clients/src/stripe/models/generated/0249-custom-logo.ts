import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomLogo = Schema.Struct({
  content_type: Schema.NullOr(Schema.String),
  url: Schema.String,
})
export type CustomLogo = typeof CustomLogo.Type
