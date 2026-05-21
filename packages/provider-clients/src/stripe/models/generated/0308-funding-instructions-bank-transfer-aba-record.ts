import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferAbaRecord = Schema.Struct({
  account_holder_address: Schema.suspend(
    (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
  ),
  account_holder_name: Schema.String,
  account_number: Schema.String,
  account_type: Schema.String,
  bank_address: Schema.suspend(
    (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
  ),
  bank_name: Schema.String,
  routing_number: Schema.String
})
export type FundingInstructionsBankTransferAbaRecord = typeof FundingInstructionsBankTransferAbaRecord.Type
