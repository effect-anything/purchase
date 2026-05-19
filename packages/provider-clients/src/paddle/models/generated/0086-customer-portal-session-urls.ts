import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerPortalSessionUrls = Schema.Struct({
  general: Schema.suspend(() => Models.CustomerPortalSessionUrlsGeneral),
  subscriptions: Schema.optional(Schema.Array(Schema.suspend(() => Models.CustomerPortalSessionUrlsSubscriptionsItem))),
})
export type CustomerPortalSessionUrls = typeof CustomerPortalSessionUrls.Type
