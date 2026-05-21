import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type PaymentMethodCardGeneratedCard = {
  readonly charge: string | null
  readonly payment_method_details: Models.CardGeneratedFromPaymentMethodDetails | null
  readonly setup_attempt: string | Models.SetupAttempt | null
}

export const PaymentMethodCardGeneratedCard = Schema.Struct({
  charge: Schema.NullOr(Schema.String),
  payment_method_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CardGeneratedFromPaymentMethodDetails, any, any> =>
        Models.CardGeneratedFromPaymentMethodDetails as Schema.Schema<
          Models.CardGeneratedFromPaymentMethodDetails,
          any,
          any
        >
    )
  ),
  setup_attempt: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.SetupAttempt, any, any> =>
          Models.SetupAttempt as Schema.Schema<Models.SetupAttempt, any, any>
      )
    )
  )
})
