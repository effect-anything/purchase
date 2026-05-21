import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingAuthorizationAmountDetails = Schema.Struct({
  atm_fee: Schema.NullOr(Schema.Number),
  cashback_amount: Schema.NullOr(Schema.Number)
})
export type IssuingAuthorizationAmountDetails = typeof IssuingAuthorizationAmountDetails.Type
