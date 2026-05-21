import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentProcessing2 = Schema.Struct({
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentCardProcessing, any, any> =>
        Models.PaymentIntentCardProcessing as Schema.Schema<Models.PaymentIntentCardProcessing, any, any>
    )
  ),
  type: Schema.Literal("card")
})
export type PaymentIntentProcessing2 = typeof PaymentIntentProcessing2.Type
