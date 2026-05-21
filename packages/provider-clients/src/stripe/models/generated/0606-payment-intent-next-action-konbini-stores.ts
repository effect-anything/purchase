import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionKonbiniStores = Schema.Struct({
  familymart: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionKonbiniFamilymart, any, any> =>
        Models.PaymentIntentNextActionKonbiniFamilymart as Schema.Schema<
          Models.PaymentIntentNextActionKonbiniFamilymart,
          any,
          any
        >
    )
  ),
  lawson: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionKonbiniLawson, any, any> =>
        Models.PaymentIntentNextActionKonbiniLawson as Schema.Schema<
          Models.PaymentIntentNextActionKonbiniLawson,
          any,
          any
        >
    )
  ),
  ministop: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionKonbiniMinistop, any, any> =>
        Models.PaymentIntentNextActionKonbiniMinistop as Schema.Schema<
          Models.PaymentIntentNextActionKonbiniMinistop,
          any,
          any
        >
    )
  ),
  seicomart: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionKonbiniSeicomart, any, any> =>
        Models.PaymentIntentNextActionKonbiniSeicomart as Schema.Schema<
          Models.PaymentIntentNextActionKonbiniSeicomart,
          any,
          any
        >
    )
  )
})
export type PaymentIntentNextActionKonbiniStores = typeof PaymentIntentNextActionKonbiniStores.Type
