import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerAcceptance = Schema.Struct({
  accepted_at: Schema.NullOr(Schema.Number),
  offline: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.OfflineAcceptance, any, any> =>
        Models.OfflineAcceptance as Schema.Schema<Models.OfflineAcceptance, any, any>
    )
  ),
  online: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.OnlineAcceptance, any, any> =>
        Models.OnlineAcceptance as Schema.Schema<Models.OnlineAcceptance, any, any>
    )
  ),
  type: Schema.Literal("offline", "online")
})
export type CustomerAcceptance = typeof CustomerAcceptance.Type
