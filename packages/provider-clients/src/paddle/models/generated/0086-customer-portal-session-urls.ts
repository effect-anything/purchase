import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerPortalSessionUrls = Schema.Struct({
  general: Schema.suspend(
    (): Schema.Schema<Models.CustomerPortalSessionUrlsGeneral, any, any> =>
      Models.CustomerPortalSessionUrlsGeneral as Schema.Schema<Models.CustomerPortalSessionUrlsGeneral, any, any>
  ),
  subscriptions: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.CustomerPortalSessionUrlsSubscriptionsItem, any, any> =>
          Models.CustomerPortalSessionUrlsSubscriptionsItem as Schema.Schema<
            Models.CustomerPortalSessionUrlsSubscriptionsItem,
            any,
            any
          >
      )
    )
  )
})
export type CustomerPortalSessionUrls = typeof CustomerPortalSessionUrls.Type
