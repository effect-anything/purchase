import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const FundingInstructionsBankTransferFinancialAddress = Schema.Struct({
  aba: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.FundingInstructionsBankTransferAbaRecord, any, any> =>
        Models.FundingInstructionsBankTransferAbaRecord as Schema.Schema<
          Models.FundingInstructionsBankTransferAbaRecord,
          any,
          any
        >
    )
  ),
  iban: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.FundingInstructionsBankTransferIbanRecord, any, any> =>
        Models.FundingInstructionsBankTransferIbanRecord as Schema.Schema<
          Models.FundingInstructionsBankTransferIbanRecord,
          any,
          any
        >
    )
  ),
  sort_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.FundingInstructionsBankTransferSortCodeRecord, any, any> =>
        Models.FundingInstructionsBankTransferSortCodeRecord as Schema.Schema<
          Models.FundingInstructionsBankTransferSortCodeRecord,
          any,
          any
        >
    )
  ),
  spei: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.FundingInstructionsBankTransferSpeiRecord, any, any> =>
        Models.FundingInstructionsBankTransferSpeiRecord as Schema.Schema<
          Models.FundingInstructionsBankTransferSpeiRecord,
          any,
          any
        >
    )
  ),
  supported_networks: Schema.optional(
    Schema.Array(Schema.Literal("ach", "bacs", "domestic_wire_us", "fps", "sepa", "spei", "swift", "zengin"))
  ),
  swift: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.FundingInstructionsBankTransferSwiftRecord, any, any> =>
        Models.FundingInstructionsBankTransferSwiftRecord as Schema.Schema<
          Models.FundingInstructionsBankTransferSwiftRecord,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("aba", "iban", "sort_code", "spei", "swift", "zengin"),
  zengin: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.FundingInstructionsBankTransferZenginRecord, any, any> =>
        Models.FundingInstructionsBankTransferZenginRecord as Schema.Schema<
          Models.FundingInstructionsBankTransferZenginRecord,
          any,
          any
        >
    )
  )
})
export type FundingInstructionsBankTransferFinancialAddress =
  typeof FundingInstructionsBankTransferFinancialAddress.Type
