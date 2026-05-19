import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferZenginRecord = Schema.Struct({
  account_holder_address: Schema.suspend((): typeof Models.Address => Models.Address),
  account_holder_name: Schema.NullOr(Schema.String),
  account_number: Schema.NullOr(Schema.String),
  account_type: Schema.NullOr(Schema.String),
  bank_address: Schema.suspend((): typeof Models.Address => Models.Address),
  bank_code: Schema.NullOr(Schema.String),
  bank_name: Schema.NullOr(Schema.String),
  branch_code: Schema.NullOr(Schema.String),
  branch_name: Schema.NullOr(Schema.String),
})
export type FundingInstructionsBankTransferZenginRecord = typeof FundingInstructionsBankTransferZenginRecord.Type
