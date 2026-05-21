import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerBalanceCustomerBalanceSettings = Schema.Struct({
  reconciliation_mode: Schema.Literal("automatic", "manual"),
  using_merchant_default: Schema.Boolean
})
export type CustomerBalanceCustomerBalanceSettings = typeof CustomerBalanceCustomerBalanceSettings.Type
