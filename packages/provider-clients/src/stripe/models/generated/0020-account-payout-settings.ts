import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountPayoutSettings = Schema.Struct({
  debit_negative_balances: Schema.Boolean,
  schedule: Schema.suspend(
    (): Schema.Schema<Models.TransferSchedule, any, any> =>
      Models.TransferSchedule as Schema.Schema<Models.TransferSchedule, any, any>
  ),
  statement_descriptor: Schema.NullOr(Schema.String)
})
export type AccountPayoutSettings = typeof AccountPayoutSettings.Type
