import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferIbanRecord = Schema.Struct({
  account_holder_address: Schema.suspend((): typeof Models.Address => Models.Address),
  account_holder_name: Schema.String,
  bank_address: Schema.suspend((): typeof Models.Address => Models.Address),
  bic: Schema.String,
  country: Schema.String,
  iban: Schema.String,
})
export type FundingInstructionsBankTransferIbanRecord = typeof FundingInstructionsBankTransferIbanRecord.Type
