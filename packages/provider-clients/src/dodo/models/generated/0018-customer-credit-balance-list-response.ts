import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerCreditBalanceListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CustomerCreditBalance, any, any> =>
        Models.CustomerCreditBalance as Schema.Schema<Models.CustomerCreditBalance, any, any>
    )
  ),
  total: Schema.optional(Schema.Number)
})
export type CustomerCreditBalanceListResponse = typeof CustomerCreditBalanceListResponse.Type
