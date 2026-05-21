import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferSpeiRecord = Schema.Struct({
  account_holder_address: Schema.suspend(
    (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
  ),
  account_holder_name: Schema.String,
  bank_address: Schema.suspend(
    (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
  ),
  bank_code: Schema.String,
  bank_name: Schema.String,
  clabe: Schema.String
})
export type FundingInstructionsBankTransferSpeiRecord = typeof FundingInstructionsBankTransferSpeiRecord.Type
