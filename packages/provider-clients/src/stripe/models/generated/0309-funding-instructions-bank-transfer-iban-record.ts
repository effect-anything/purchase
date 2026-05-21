import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferIbanRecord = Schema.Struct({
  account_holder_address: Schema.suspend(
    (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
  ),
  account_holder_name: Schema.String,
  bank_address: Schema.suspend(
    (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
  ),
  bic: Schema.String,
  country: Schema.String,
  iban: Schema.String
})
export type FundingInstructionsBankTransferIbanRecord = typeof FundingInstructionsBankTransferIbanRecord.Type
