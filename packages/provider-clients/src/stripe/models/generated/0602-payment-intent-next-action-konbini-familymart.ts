import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionKonbiniFamilymart = Schema.Struct({
  confirmation_number: Schema.optional(Schema.String),
  payment_code: Schema.String
})
export type PaymentIntentNextActionKonbiniFamilymart = typeof PaymentIntentNextActionKonbiniFamilymart.Type
