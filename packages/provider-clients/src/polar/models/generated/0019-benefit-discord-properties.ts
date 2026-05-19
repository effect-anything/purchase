import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitDiscordProperties = Schema.Struct({
  guild_id: Schema.String,
  role_id: Schema.String,
  kick_member: Schema.Boolean,
  guild_token: Schema.String,
})
export type BenefitDiscordProperties = typeof BenefitDiscordProperties.Type
