import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionVerifyWithMicrodeposits = Schema.Struct({
  arrival_date: Schema.Number,
  hosted_verification_url: Schema.String,
  microdeposit_type: Schema.NullOr(Schema.Literal("amounts", "descriptor_code"))
})
export type PaymentIntentNextActionVerifyWithMicrodeposits = typeof PaymentIntentNextActionVerifyWithMicrodeposits.Type
