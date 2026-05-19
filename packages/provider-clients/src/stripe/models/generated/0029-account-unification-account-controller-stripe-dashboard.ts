import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountUnificationAccountControllerStripeDashboard = Schema.Struct({
  type: Schema.Literal("express", "full", "none"),
})
export type AccountUnificationAccountControllerStripeDashboard = typeof AccountUnificationAccountControllerStripeDashboard.Type
