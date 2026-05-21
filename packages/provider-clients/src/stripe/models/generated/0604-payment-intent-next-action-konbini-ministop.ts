import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionKonbiniMinistop = Schema.Struct({
  confirmation_number: Schema.optional(Schema.String),
  payment_code: Schema.String
})
export type PaymentIntentNextActionKonbiniMinistop = typeof PaymentIntentNextActionKonbiniMinistop.Type
