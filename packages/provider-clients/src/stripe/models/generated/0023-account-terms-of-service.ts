import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountTermsOfService = Schema.Struct({
  date: Schema.NullOr(Schema.Number),
  ip: Schema.NullOr(Schema.String),
  user_agent: Schema.optional(Schema.String),
})
export type AccountTermsOfService = typeof AccountTermsOfService.Type
