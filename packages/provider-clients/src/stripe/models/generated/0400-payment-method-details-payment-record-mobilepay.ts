import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordMobilepay = Schema.Struct({
  card: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodMobilepayDetailsResourceCard => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodMobilepayDetailsResourceCard)),
})
export type PaymentMethodDetailsPaymentRecordMobilepay = typeof PaymentMethodDetailsPaymentRecordMobilepay.Type
