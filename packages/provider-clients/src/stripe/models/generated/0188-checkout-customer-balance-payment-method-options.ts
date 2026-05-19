import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutCustomerBalancePaymentMethodOptions = Schema.Struct({
  bank_transfer: Schema.optional(Schema.suspend((): typeof Models.CheckoutCustomerBalanceBankTransferPaymentMethodOptions => Models.CheckoutCustomerBalanceBankTransferPaymentMethodOptions)),
  funding_type: Schema.NullOr(Schema.Literal("bank_transfer")),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type CheckoutCustomerBalancePaymentMethodOptions = typeof CheckoutCustomerBalancePaymentMethodOptions.Type
