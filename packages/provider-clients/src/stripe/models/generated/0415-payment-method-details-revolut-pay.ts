import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsRevolutPay = Schema.Struct({
  funding: Schema.optional(Schema.suspend((): typeof Models.RevolutPayUnderlyingPaymentMethodFundingDetails => Models.RevolutPayUnderlyingPaymentMethodFundingDetails)),
  transaction_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsRevolutPay = typeof PaymentMethodDetailsRevolutPay.Type
