import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerPortalSession = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.CustomerPortalSessionId> => Models.CustomerPortalSessionId),
  customer_id: Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId),
  urls: Schema.suspend((): Schema.Schema<Models.CustomerPortalSessionUrls> => Models.CustomerPortalSessionUrls),
  created_at: Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp)
})
export type CustomerPortalSession = typeof CustomerPortalSession.Type
