import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransfer = Schema.Struct(
  {
    eu_bank_transfer: Schema.optional(
      Schema.suspend(
        (): Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceEuBankTransfer,
          any,
          any
        > =>
          Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceEuBankTransfer as Schema.Schema<
            Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceEuBankTransfer,
            any,
            any
          >
      )
    ),
    gb_bank_transfer: Schema.optional(
      Schema.suspend(
        (): Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceGbBankTransfer,
          any,
          any
        > =>
          Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceGbBankTransfer as Schema.Schema<
            Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceGbBankTransfer,
            any,
            any
          >
      )
    ),
    jp_bank_transfer: Schema.optional(
      Schema.suspend(
        (): Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceJpBankTransfer,
          any,
          any
        > =>
          Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceJpBankTransfer as Schema.Schema<
            Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceJpBankTransfer,
            any,
            any
          >
      )
    ),
    reference: Schema.NullOr(Schema.String),
    type: Schema.Literal(
      "eu_bank_transfer",
      "gb_bank_transfer",
      "jp_bank_transfer",
      "mx_bank_transfer",
      "us_bank_transfer"
    ),
    us_bank_transfer: Schema.optional(
      Schema.suspend(
        (): Schema.Schema<
          Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceUsBankTransfer,
          any,
          any
        > =>
          Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceUsBankTransfer as Schema.Schema<
            Models.CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransferResourceUsBankTransfer,
            any,
            any
          >
      )
    )
  }
)
export type CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransfer =
  typeof CustomerBalanceResourceCashBalanceTransactionResourceFundedTransactionResourceBankTransfer.Type
