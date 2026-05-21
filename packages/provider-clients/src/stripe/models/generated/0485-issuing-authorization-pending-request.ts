import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingAuthorizationPendingRequest = Schema.Struct({
  amount: Schema.Number,
  amount_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationAmountDetails, any, any> =>
        Models.IssuingAuthorizationAmountDetails as Schema.Schema<Models.IssuingAuthorizationAmountDetails, any, any>
    )
  ),
  currency: Schema.String,
  is_amount_controllable: Schema.Boolean,
  merchant_amount: Schema.Number,
  merchant_currency: Schema.String,
  network_risk_score: Schema.NullOr(Schema.Number)
})
export type IssuingAuthorizationPendingRequest = typeof IssuingAuthorizationPendingRequest.Type
