import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsCustomerBalance = Schema.Struct({
  bank_transfer: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodOptionsCustomerBalanceBankTransfer => Models.PaymentMethodOptionsCustomerBalanceBankTransfer)),
  funding_type: Schema.NullOr(Schema.Literal("bank_transfer")),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type PaymentMethodOptionsCustomerBalance = typeof PaymentMethodOptionsCustomerBalance.Type
