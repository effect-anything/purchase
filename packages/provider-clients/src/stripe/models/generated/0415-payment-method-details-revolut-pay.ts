import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsRevolutPay = Schema.Struct({
  funding: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RevolutPayUnderlyingPaymentMethodFundingDetails, any, any> =>
        Models.RevolutPayUnderlyingPaymentMethodFundingDetails as Schema.Schema<
          Models.RevolutPayUnderlyingPaymentMethodFundingDetails,
          any,
          any
        >
    )
  ),
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsRevolutPay = typeof PaymentMethodDetailsRevolutPay.Type
