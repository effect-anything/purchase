import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const FundingInstructions = Schema.Struct({
  bank_transfer: Schema.suspend((): typeof Models.FundingInstructionsBankTransfer => Models.FundingInstructionsBankTransfer),
  currency: Schema.String,
  funding_type: Schema.Literal("bank_transfer"),
  livemode: Schema.Boolean,
  object: Schema.Literal("funding_instructions"),
})
export type FundingInstructions = typeof FundingInstructions.Type
