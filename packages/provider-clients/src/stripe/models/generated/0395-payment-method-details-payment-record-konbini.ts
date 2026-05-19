import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordKonbini = Schema.Struct({
  store: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodKonbiniDetailsResourceStore => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodKonbiniDetailsResourceStore)),
})
export type PaymentMethodDetailsPaymentRecordKonbini = typeof PaymentMethodDetailsPaymentRecordKonbini.Type
