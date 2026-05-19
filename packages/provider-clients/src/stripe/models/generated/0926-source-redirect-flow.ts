import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceRedirectFlow = Schema.Struct({
  failure_reason: Schema.NullOr(Schema.String),
  return_url: Schema.String,
  status: Schema.String,
  url: Schema.String,
})
export type SourceRedirectFlow = typeof SourceRedirectFlow.Type
