import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceUsBankTransfer =
  Schema.Struct({
    network: Schema.optional(Schema.Literal("ach", "domestic_wire_us", "swift")),
    sender_name: Schema.NullOr(Schema.String)
  })
export type CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceUsBankTransfer =
  typeof CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceUsBankTransfer.Type
