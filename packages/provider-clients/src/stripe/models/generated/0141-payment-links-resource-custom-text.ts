import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomText = Schema.Struct({
  after_submit: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCustomTextPosition, any, any> =>
        Models.PaymentLinksResourceCustomTextPosition as Schema.Schema<
          Models.PaymentLinksResourceCustomTextPosition,
          any,
          any
        >
    )
  ),
  shipping_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCustomTextPosition, any, any> =>
        Models.PaymentLinksResourceCustomTextPosition as Schema.Schema<
          Models.PaymentLinksResourceCustomTextPosition,
          any,
          any
        >
    )
  ),
  submit: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCustomTextPosition, any, any> =>
        Models.PaymentLinksResourceCustomTextPosition as Schema.Schema<
          Models.PaymentLinksResourceCustomTextPosition,
          any,
          any
        >
    )
  ),
  terms_of_service_acceptance: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCustomTextPosition, any, any> =>
        Models.PaymentLinksResourceCustomTextPosition as Schema.Schema<
          Models.PaymentLinksResourceCustomTextPosition,
          any,
          any
        >
    )
  )
})
export type PaymentLinksResourceCustomText = typeof PaymentLinksResourceCustomText.Type
