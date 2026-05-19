import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CreditEntitlementListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.CreditEntitlement)),
  total: Schema.optional(Schema.Number),
})
export type CreditEntitlementListResponse = typeof CreditEntitlementListResponse.Type
