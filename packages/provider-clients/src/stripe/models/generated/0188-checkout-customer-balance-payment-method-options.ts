import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutCustomerBalancePaymentMethodOptions = Schema.Struct({
  bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutCustomerBalanceBankTransferPaymentMethodOptions, any, any> =>
        Models.CheckoutCustomerBalanceBankTransferPaymentMethodOptions as Schema.Schema<
          Models.CheckoutCustomerBalanceBankTransferPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  funding_type: Schema.NullOr(Schema.Literal("bank_transfer")),
  setup_future_usage: Schema.optional(Schema.Literal("none"))
})
export type CheckoutCustomerBalancePaymentMethodOptions = typeof CheckoutCustomerBalancePaymentMethodOptions.Type
