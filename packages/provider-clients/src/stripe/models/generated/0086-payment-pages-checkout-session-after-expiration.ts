import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionAfterExpiration = Schema.Struct({
  recovery: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionAfterExpirationRecovery, any, any> =>
        Models.PaymentPagesCheckoutSessionAfterExpirationRecovery as Schema.Schema<
          Models.PaymentPagesCheckoutSessionAfterExpirationRecovery,
          any,
          any
        >
    )
  )
})
export type PaymentPagesCheckoutSessionAfterExpiration = typeof PaymentPagesCheckoutSessionAfterExpiration.Type
