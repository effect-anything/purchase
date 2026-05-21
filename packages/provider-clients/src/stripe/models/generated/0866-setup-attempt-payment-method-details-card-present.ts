import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SetupAttemptPaymentMethodDetailsCardPresent = {
  readonly generated_card: string | Models.PaymentMethod | null
  readonly offline: Models.PaymentMethodDetailsCardPresentOffline | null
}

export const SetupAttemptPaymentMethodDetailsCardPresent = Schema.Struct({
  generated_card: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethod, any, any> =>
          Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
      )
    )
  ),
  offline: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardPresentOffline, any, any> =>
        Models.PaymentMethodDetailsCardPresentOffline as Schema.Schema<
          Models.PaymentMethodDetailsCardPresentOffline,
          any,
          any
        >
    )
  )
})
