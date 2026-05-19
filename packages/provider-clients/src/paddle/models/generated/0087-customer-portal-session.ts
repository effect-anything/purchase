import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerPortalSession = Schema.Struct({
  id: Schema.suspend(() => Models.CustomerPortalSessionId),
  customer_id: Schema.suspend(() => Models.CustomerId),
  urls: Schema.suspend(() => Models.CustomerPortalSessionUrls),
  created_at: Schema.suspend(() => Models.Timestamp),
})
export type CustomerPortalSession = typeof CustomerPortalSession.Type
