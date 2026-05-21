import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type IssuingAuthorization = {
  readonly amount: number
  readonly amount_details: Models.IssuingAuthorizationAmountDetails | null
  readonly approved: boolean
  readonly authorization_method: "chip" | "contactless" | "keyed_in" | "online" | "swipe"
  readonly balance_transactions: ReadonlyArray<Models.BalanceTransaction>
  readonly card: Models.IssuingCard
  readonly card_presence: "not_present" | "present" | null
  readonly cardholder: string | Models.IssuingCardholder | null
  readonly created: number
  readonly currency: string
  readonly fleet: Models.IssuingAuthorizationFleetData | null
  readonly fraud_challenges?: ReadonlyArray<Models.IssuingAuthorizationFraudChallenge> | null
  readonly fuel: Models.IssuingAuthorizationFuelData | null
  readonly id: string
  readonly livemode: boolean
  readonly merchant_amount: number
  readonly merchant_currency: string
  readonly merchant_data: Models.IssuingAuthorizationMerchantData
  readonly metadata: Readonly<Record<string, string>>
  readonly network_data: Models.IssuingAuthorizationNetworkData | null
  readonly object: "issuing.authorization"
  readonly pending_request: Models.IssuingAuthorizationPendingRequest | null
  readonly request_history: ReadonlyArray<Models.IssuingAuthorizationRequest2>
  readonly status: "closed" | "expired" | "pending" | "reversed"
  readonly token?: string | Models.IssuingToken | null
  readonly transactions: ReadonlyArray<Models.IssuingTransaction>
  readonly treasury?: Models.IssuingAuthorizationTreasury | null
  readonly verification_data: Models.IssuingAuthorizationVerificationData
  readonly verified_by_fraud_challenge: boolean | null
  readonly wallet: string | null
}

export const IssuingAuthorization = Schema.Struct({
  amount: Schema.Number,
  amount_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationAmountDetails, any, any> =>
        Models.IssuingAuthorizationAmountDetails as Schema.Schema<Models.IssuingAuthorizationAmountDetails, any, any>
    )
  ),
  approved: Schema.Boolean,
  authorization_method: Schema.Literal("chip", "contactless", "keyed_in", "online", "swipe"),
  balance_transactions: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.BalanceTransaction, any, any> =>
        Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
    )
  ),
  card: Schema.suspend(
    (): Schema.Schema<Models.IssuingCard, any, any> => Models.IssuingCard as Schema.Schema<Models.IssuingCard, any, any>
  ),
  card_presence: Schema.NullOr(Schema.Literal("not_present", "present")),
  cardholder: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.IssuingCardholder, any, any> =>
          Models.IssuingCardholder as Schema.Schema<Models.IssuingCardholder, any, any>
      )
    )
  ),
  created: Schema.Number,
  currency: Schema.String,
  fleet: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationFleetData, any, any> =>
        Models.IssuingAuthorizationFleetData as Schema.Schema<Models.IssuingAuthorizationFleetData, any, any>
    )
  ),
  fraud_challenges: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.IssuingAuthorizationFraudChallenge, any, any> =>
            Models.IssuingAuthorizationFraudChallenge as Schema.Schema<
              Models.IssuingAuthorizationFraudChallenge,
              any,
              any
            >
        )
      )
    )
  ),
  fuel: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationFuelData, any, any> =>
        Models.IssuingAuthorizationFuelData as Schema.Schema<Models.IssuingAuthorizationFuelData, any, any>
    )
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  merchant_amount: Schema.Number,
  merchant_currency: Schema.String,
  merchant_data: Schema.suspend(
    (): Schema.Schema<Models.IssuingAuthorizationMerchantData, any, any> =>
      Models.IssuingAuthorizationMerchantData as Schema.Schema<Models.IssuingAuthorizationMerchantData, any, any>
  ),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  network_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationNetworkData, any, any> =>
        Models.IssuingAuthorizationNetworkData as Schema.Schema<Models.IssuingAuthorizationNetworkData, any, any>
    )
  ),
  object: Schema.Literal("issuing.authorization"),
  pending_request: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationPendingRequest, any, any> =>
        Models.IssuingAuthorizationPendingRequest as Schema.Schema<Models.IssuingAuthorizationPendingRequest, any, any>
    )
  ),
  request_history: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationRequest2, any, any> =>
        Models.IssuingAuthorizationRequest2 as Schema.Schema<Models.IssuingAuthorizationRequest2, any, any>
    )
  ),
  status: Schema.Literal("closed", "expired", "pending", "reversed"),
  token: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.IssuingToken, any, any> =>
            Models.IssuingToken as Schema.Schema<Models.IssuingToken, any, any>
        )
      )
    )
  ),
  transactions: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransaction, any, any> =>
        Models.IssuingTransaction as Schema.Schema<Models.IssuingTransaction, any, any>
    )
  ),
  treasury: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.IssuingAuthorizationTreasury, any, any> =>
          Models.IssuingAuthorizationTreasury as Schema.Schema<Models.IssuingAuthorizationTreasury, any, any>
      )
    )
  ),
  verification_data: Schema.suspend(
    (): Schema.Schema<Models.IssuingAuthorizationVerificationData, any, any> =>
      Models.IssuingAuthorizationVerificationData as Schema.Schema<
        Models.IssuingAuthorizationVerificationData,
        any,
        any
      >
  ),
  verified_by_fraud_challenge: Schema.NullOr(Schema.Boolean),
  wallet: Schema.NullOr(Schema.String)
})
