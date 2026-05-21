import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CardGeneratedFromPaymentMethodDetails = Schema.Struct({
  card_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardPresent, any, any> =>
        Models.PaymentMethodDetailsCardPresent as Schema.Schema<Models.PaymentMethodDetailsCardPresent, any, any>
    )
  ),
  type: Schema.String
})
export type CardGeneratedFromPaymentMethodDetails = typeof CardGeneratedFromPaymentMethodDetails.Type
