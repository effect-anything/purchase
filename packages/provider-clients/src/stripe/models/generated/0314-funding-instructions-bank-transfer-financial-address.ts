import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferFinancialAddress = Schema.Struct({
  aba: Schema.optional(Schema.suspend((): typeof Models.FundingInstructionsBankTransferAbaRecord => Models.FundingInstructionsBankTransferAbaRecord)),
  iban: Schema.optional(Schema.suspend((): typeof Models.FundingInstructionsBankTransferIbanRecord => Models.FundingInstructionsBankTransferIbanRecord)),
  sort_code: Schema.optional(Schema.suspend((): typeof Models.FundingInstructionsBankTransferSortCodeRecord => Models.FundingInstructionsBankTransferSortCodeRecord)),
  spei: Schema.optional(Schema.suspend((): typeof Models.FundingInstructionsBankTransferSpeiRecord => Models.FundingInstructionsBankTransferSpeiRecord)),
  supported_networks: Schema.optional(Schema.Array(Schema.Literal("ach", "bacs", "domestic_wire_us", "fps", "sepa", "spei", "swift", "zengin"))),
  swift: Schema.optional(Schema.suspend((): typeof Models.FundingInstructionsBankTransferSwiftRecord => Models.FundingInstructionsBankTransferSwiftRecord)),
  type: Schema.Literal("aba", "iban", "sort_code", "spei", "swift", "zengin"),
  zengin: Schema.optional(Schema.suspend((): typeof Models.FundingInstructionsBankTransferZenginRecord => Models.FundingInstructionsBankTransferZenginRecord)),
})
export type FundingInstructionsBankTransferFinancialAddress = typeof FundingInstructionsBankTransferFinancialAddress.Type
