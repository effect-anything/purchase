import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountTosAcceptance = Schema.Struct({
  date: Schema.optional(Schema.NullOr(Schema.Number)),
  ip: Schema.optional(Schema.NullOr(Schema.String)),
  service_agreement: Schema.optional(Schema.String),
  user_agent: Schema.optional(Schema.NullOr(Schema.String)),
})
export type AccountTosAcceptance = typeof AccountTosAcceptance.Type
