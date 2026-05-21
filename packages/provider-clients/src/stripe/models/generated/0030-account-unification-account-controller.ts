import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountUnificationAccountController = Schema.Struct({
  fees: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountUnificationAccountControllerFees, any, any> =>
        Models.AccountUnificationAccountControllerFees as Schema.Schema<
          Models.AccountUnificationAccountControllerFees,
          any,
          any
        >
    )
  ),
  is_controller: Schema.optional(Schema.Boolean),
  losses: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountUnificationAccountControllerLosses, any, any> =>
        Models.AccountUnificationAccountControllerLosses as Schema.Schema<
          Models.AccountUnificationAccountControllerLosses,
          any,
          any
        >
    )
  ),
  requirement_collection: Schema.optional(Schema.Literal("application", "stripe")),
  stripe_dashboard: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountUnificationAccountControllerStripeDashboard, any, any> =>
        Models.AccountUnificationAccountControllerStripeDashboard as Schema.Schema<
          Models.AccountUnificationAccountControllerStripeDashboard,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("account", "application")
})
export type AccountUnificationAccountController = typeof AccountUnificationAccountController.Type
