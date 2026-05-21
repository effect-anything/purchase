import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerPortalSession = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.CustomerPortalSessionId, any, any> =>
      Models.CustomerPortalSessionId as Schema.Schema<Models.CustomerPortalSessionId, any, any>
  ),
  customer_id: Schema.suspend(
    (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
  ),
  urls: Schema.suspend(
    (): Schema.Schema<Models.CustomerPortalSessionUrls, any, any> =>
      Models.CustomerPortalSessionUrls as Schema.Schema<Models.CustomerPortalSessionUrls, any, any>
  ),
  created_at: Schema.suspend(
    (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
  )
})
export type CustomerPortalSession = typeof CustomerPortalSession.Type
