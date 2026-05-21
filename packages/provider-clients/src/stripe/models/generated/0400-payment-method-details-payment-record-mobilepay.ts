import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordMobilepay = Schema.Struct({
  card: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodMobilepayDetailsResourceCard,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodMobilepayDetailsResourceCard as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodMobilepayDetailsResourceCard,
          any,
          any
        >
    )
  )
})
export type PaymentMethodDetailsPaymentRecordMobilepay = typeof PaymentMethodDetailsPaymentRecordMobilepay.Type
