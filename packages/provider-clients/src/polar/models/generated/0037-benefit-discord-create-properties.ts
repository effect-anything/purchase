import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitDiscordCreateProperties = Schema.Struct({
  guild_token: Schema.String,
  role_id: Schema.String,
  kick_member: Schema.Boolean,
})
export type BenefitDiscordCreateProperties = typeof BenefitDiscordCreateProperties.Type
