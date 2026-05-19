import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsKonbini = Schema.Struct({
  store: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsKonbiniStore => Models.PaymentMethodDetailsKonbiniStore)),
})
export type PaymentMethodDetailsKonbini = typeof PaymentMethodDetailsKonbini.Type
