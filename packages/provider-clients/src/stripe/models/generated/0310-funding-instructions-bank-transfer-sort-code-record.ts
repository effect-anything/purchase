import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferSortCodeRecord = Schema.Struct({
  account_holder_address: Schema.suspend((): typeof Models.Address => Models.Address),
  account_holder_name: Schema.String,
  account_number: Schema.String,
  bank_address: Schema.suspend((): typeof Models.Address => Models.Address),
  sort_code: Schema.String,
})
export type FundingInstructionsBankTransferSortCodeRecord = typeof FundingInstructionsBankTransferSortCodeRecord.Type
