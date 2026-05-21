import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditEntitlementListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CreditEntitlement, any, any> =>
        Models.CreditEntitlement as Schema.Schema<Models.CreditEntitlement, any, any>
    )
  ),
  total: Schema.optional(Schema.Number)
})
export type CreditEntitlementListResponse = typeof CreditEntitlementListResponse.Type
