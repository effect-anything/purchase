import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodKonbiniDetailsResourceStore = Schema.Struct({
  chain: Schema.NullOr(Schema.Literal("familymart", "lawson", "ministop", "seicomart")),
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodKonbiniDetailsResourceStore = typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodKonbiniDetailsResourceStore.Type
