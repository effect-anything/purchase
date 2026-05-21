import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentNextActionVerifyWithMicrodeposits = Schema.Struct({
  arrival_date: Schema.Number,
  hosted_verification_url: Schema.String,
  microdeposit_type: Schema.NullOr(Schema.Literal("amounts", "descriptor_code"))
})
export type SetupIntentNextActionVerifyWithMicrodeposits = typeof SetupIntentNextActionVerifyWithMicrodeposits.Type
