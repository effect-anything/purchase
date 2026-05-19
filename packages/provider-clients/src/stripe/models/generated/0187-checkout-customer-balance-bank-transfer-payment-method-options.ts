import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutCustomerBalanceBankTransferPaymentMethodOptions = Schema.Struct({
  eu_bank_transfer: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodOptionsCustomerBalanceEuBankAccount => Models.PaymentMethodOptionsCustomerBalanceEuBankAccount)),
  requested_address_types: Schema.optional(Schema.Array(Schema.Literal("aba", "iban", "sepa", "sort_code", "spei", "swift", "zengin"))),
  type: Schema.NullOr(Schema.Literal("eu_bank_transfer", "gb_bank_transfer", "jp_bank_transfer", "mx_bank_transfer", "us_bank_transfer")),
})
export type CheckoutCustomerBalanceBankTransferPaymentMethodOptions = typeof CheckoutCustomerBalanceBankTransferPaymentMethodOptions.Type
