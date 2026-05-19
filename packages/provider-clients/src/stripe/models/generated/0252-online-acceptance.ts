import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const OnlineAcceptance = Schema.Struct({
  ip_address: Schema.NullOr(Schema.String),
  user_agent: Schema.NullOr(Schema.String),
})
export type OnlineAcceptance = typeof OnlineAcceptance.Type
