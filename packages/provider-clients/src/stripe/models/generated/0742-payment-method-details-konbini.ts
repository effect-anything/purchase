import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsKonbini = Schema.Struct({
  store: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsKonbiniStore, any, any> =>
        Models.PaymentMethodDetailsKonbiniStore as Schema.Schema<Models.PaymentMethodDetailsKonbiniStore, any, any>
    )
  )
})
export type PaymentMethodDetailsKonbini = typeof PaymentMethodDetailsKonbini.Type
