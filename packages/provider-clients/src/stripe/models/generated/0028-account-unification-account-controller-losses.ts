import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountUnificationAccountControllerLosses = Schema.Struct({
  payments: Schema.Literal("application", "stripe"),
})
export type AccountUnificationAccountControllerLosses = typeof AccountUnificationAccountControllerLosses.Type
