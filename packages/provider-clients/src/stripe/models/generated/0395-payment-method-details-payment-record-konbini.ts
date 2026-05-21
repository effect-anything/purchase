import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordKonbini = Schema.Struct({
  store: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodKonbiniDetailsResourceStore,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodKonbiniDetailsResourceStore as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodKonbiniDetailsResourceStore,
          any,
          any
        >
    )
  )
})
export type PaymentMethodDetailsPaymentRecordKonbini = typeof PaymentMethodDetailsPaymentRecordKonbini.Type
