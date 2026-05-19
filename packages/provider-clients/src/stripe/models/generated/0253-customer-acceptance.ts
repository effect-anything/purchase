import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerAcceptance = Schema.Struct({
  accepted_at: Schema.NullOr(Schema.Number),
  offline: Schema.optional(Schema.suspend((): typeof Models.OfflineAcceptance => Models.OfflineAcceptance)),
  online: Schema.optional(Schema.suspend((): typeof Models.OnlineAcceptance => Models.OnlineAcceptance)),
  type: Schema.Literal("offline", "online"),
})
export type CustomerAcceptance = typeof CustomerAcceptance.Type
