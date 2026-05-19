import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferSpeiRecord = Schema.Struct({
  account_holder_address: Schema.suspend((): typeof Models.Address => Models.Address),
  account_holder_name: Schema.String,
  bank_address: Schema.suspend((): typeof Models.Address => Models.Address),
  bank_code: Schema.String,
  bank_name: Schema.String,
  clabe: Schema.String,
})
export type FundingInstructionsBankTransferSpeiRecord = typeof FundingInstructionsBankTransferSpeiRecord.Type
