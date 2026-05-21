import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PersonAdditionalTosAcceptance = Schema.Struct({
  date: Schema.NullOr(Schema.Number),
  ip: Schema.NullOr(Schema.String),
  user_agent: Schema.NullOr(Schema.String)
})
export type PersonAdditionalTosAcceptance = typeof PersonAdditionalTosAcceptance.Type
