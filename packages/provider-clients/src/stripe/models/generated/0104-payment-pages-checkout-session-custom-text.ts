import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomText = Schema.Struct({
  after_submit: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomTextPosition, any, any> =>
        Models.PaymentPagesCheckoutSessionCustomTextPosition as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCustomTextPosition,
          any,
          any
        >
    )
  ),
  shipping_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomTextPosition, any, any> =>
        Models.PaymentPagesCheckoutSessionCustomTextPosition as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCustomTextPosition,
          any,
          any
        >
    )
  ),
  submit: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomTextPosition, any, any> =>
        Models.PaymentPagesCheckoutSessionCustomTextPosition as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCustomTextPosition,
          any,
          any
        >
    )
  ),
  terms_of_service_acceptance: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomTextPosition, any, any> =>
        Models.PaymentPagesCheckoutSessionCustomTextPosition as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCustomTextPosition,
          any,
          any
        >
    )
  )
})
export type PaymentPagesCheckoutSessionCustomText = typeof PaymentPagesCheckoutSessionCustomText.Type
