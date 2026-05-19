import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FundingInstructionsBankTransfer = Schema.Struct({
  country: Schema.String,
  financial_addresses: Schema.Array(Schema.suspend((): typeof Models.FundingInstructionsBankTransferFinancialAddress => Models.FundingInstructionsBankTransferFinancialAddress)),
  type: Schema.Literal("eu_bank_transfer", "jp_bank_transfer"),
})
export type FundingInstructionsBankTransfer = typeof FundingInstructionsBankTransfer.Type
