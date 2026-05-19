import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferSwiftRecord = Schema.Struct({
  account_holder_address: Schema.suspend((): typeof Models.Address => Models.Address),
  account_holder_name: Schema.String,
  account_number: Schema.String,
  account_type: Schema.String,
  bank_address: Schema.suspend((): typeof Models.Address => Models.Address),
  bank_name: Schema.String,
  swift_code: Schema.String,
})
export type FundingInstructionsBankTransferSwiftRecord = typeof FundingInstructionsBankTransferSwiftRecord.Type
