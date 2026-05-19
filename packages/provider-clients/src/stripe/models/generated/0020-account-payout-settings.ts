import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountPayoutSettings = Schema.Struct({
  debit_negative_balances: Schema.Boolean,
  schedule: Schema.suspend((): typeof Models.TransferSchedule => Models.TransferSchedule),
  statement_descriptor: Schema.NullOr(Schema.String),
})
export type AccountPayoutSettings = typeof AccountPayoutSettings.Type
