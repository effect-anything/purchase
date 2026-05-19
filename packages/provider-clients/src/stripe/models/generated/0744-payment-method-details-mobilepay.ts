import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsMobilepay = Schema.Struct({
  card: Schema.NullOr(Schema.suspend((): typeof Models.InternalCard => Models.InternalCard)),
})
export type PaymentMethodDetailsMobilepay = typeof PaymentMethodDetailsMobilepay.Type
