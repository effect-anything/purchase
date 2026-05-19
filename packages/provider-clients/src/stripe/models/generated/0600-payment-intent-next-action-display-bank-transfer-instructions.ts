import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionDisplayBankTransferInstructions = Schema.Struct({
  amount_remaining: Schema.NullOr(Schema.Number),
  currency: Schema.NullOr(Schema.String),
  financial_addresses: Schema.optional(Schema.Array(Schema.suspend((): typeof Models.FundingInstructionsBankTransferFinancialAddress => Models.FundingInstructionsBankTransferFinancialAddress))),
  hosted_instructions_url: Schema.NullOr(Schema.String),
  reference: Schema.NullOr(Schema.String),
  type: Schema.Literal("eu_bank_transfer", "gb_bank_transfer", "jp_bank_transfer", "mx_bank_transfer", "us_bank_transfer"),
})
export type PaymentIntentNextActionDisplayBankTransferInstructions = typeof PaymentIntentNextActionDisplayBankTransferInstructions.Type
