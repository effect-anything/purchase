import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitGrantDiscordProperties = Schema.Struct({
  account_id: Schema.optional(Schema.NullOr(Schema.String)),
  guild_id: Schema.optional(Schema.String),
  role_id: Schema.optional(Schema.String),
  granted_account_id: Schema.optional(Schema.String)
})
export type BenefitGrantDiscordProperties = typeof BenefitGrantDiscordProperties.Type
