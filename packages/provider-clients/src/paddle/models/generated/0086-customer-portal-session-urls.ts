import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerPortalSessionUrls = Schema.Struct({
  general: Schema.suspend(
    (): Schema.Schema<Models.CustomerPortalSessionUrlsGeneral> => Models.CustomerPortalSessionUrlsGeneral
  ),
  subscriptions: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.CustomerPortalSessionUrlsSubscriptionsItem> =>
          Models.CustomerPortalSessionUrlsSubscriptionsItem
      )
    )
  )
})
export type CustomerPortalSessionUrls = typeof CustomerPortalSessionUrls.Type
