import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsMobilepay = Schema.Struct({
  card: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InternalCard, any, any> =>
        Models.InternalCard as Schema.Schema<Models.InternalCard, any, any>
    )
  )
})
export type PaymentMethodDetailsMobilepay = typeof PaymentMethodDetailsMobilepay.Type
