import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsKonbiniStore = Schema.Struct({
  chain: Schema.NullOr(Schema.Literal("familymart", "lawson", "ministop", "seicomart")),
})
export type PaymentMethodDetailsKonbiniStore = typeof PaymentMethodDetailsKonbiniStore.Type
