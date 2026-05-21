import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionNameCollection = Schema.Struct({
  business: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionBusinessName, any, any> =>
        Models.PaymentPagesCheckoutSessionBusinessName as Schema.Schema<
          Models.PaymentPagesCheckoutSessionBusinessName,
          any,
          any
        >
    )
  ),
  individual: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionIndividualName, any, any> =>
        Models.PaymentPagesCheckoutSessionIndividualName as Schema.Schema<
          Models.PaymentPagesCheckoutSessionIndividualName,
          any,
          any
        >
    )
  )
})
export type PaymentPagesCheckoutSessionNameCollection = typeof PaymentPagesCheckoutSessionNameCollection.Type
