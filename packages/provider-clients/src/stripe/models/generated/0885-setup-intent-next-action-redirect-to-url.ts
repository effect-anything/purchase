import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentNextActionRedirectToUrl = Schema.Struct({
  return_url: Schema.NullOr(Schema.String),
  url: Schema.NullOr(Schema.String),
})
export type SetupIntentNextActionRedirectToUrl = typeof SetupIntentNextActionRedirectToUrl.Type
