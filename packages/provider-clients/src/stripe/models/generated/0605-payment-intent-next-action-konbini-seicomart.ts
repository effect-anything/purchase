import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionKonbiniSeicomart = Schema.Struct({
  confirmation_number: Schema.optional(Schema.String),
  payment_code: Schema.String,
})
export type PaymentIntentNextActionKonbiniSeicomart = typeof PaymentIntentNextActionKonbiniSeicomart.Type
