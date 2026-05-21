import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditGrantListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CreditGrant, any, any> =>
        Models.CreditGrant as Schema.Schema<Models.CreditGrant, any, any>
    )
  ),
  total: Schema.optional(Schema.Number)
})
export type CreditGrantListResponse = typeof CreditGrantListResponse.Type
