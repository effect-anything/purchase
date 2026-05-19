import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountUnificationAccountController = Schema.Struct({
  fees: Schema.optional(Schema.suspend((): typeof Models.AccountUnificationAccountControllerFees => Models.AccountUnificationAccountControllerFees)),
  is_controller: Schema.optional(Schema.Boolean),
  losses: Schema.optional(Schema.suspend((): typeof Models.AccountUnificationAccountControllerLosses => Models.AccountUnificationAccountControllerLosses)),
  requirement_collection: Schema.optional(Schema.Literal("application", "stripe")),
  stripe_dashboard: Schema.optional(Schema.suspend((): typeof Models.AccountUnificationAccountControllerStripeDashboard => Models.AccountUnificationAccountControllerStripeDashboard)),
  type: Schema.Literal("account", "application"),
})
export type AccountUnificationAccountController = typeof AccountUnificationAccountController.Type
