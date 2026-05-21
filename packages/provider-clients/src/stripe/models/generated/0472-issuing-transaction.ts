import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type IssuingTransaction = {
  readonly amount: number
  readonly amount_details: Models.IssuingTransactionAmountDetails | null
  readonly authorization: string | Models.IssuingAuthorization | null
  readonly balance_transaction: string | Models.BalanceTransaction | null
  readonly card: string | Models.IssuingCard
  readonly cardholder: string | Models.IssuingCardholder | null
  readonly created: number
  readonly currency: string
  readonly dispute: string | Models.IssuingDispute | null
  readonly id: string
  readonly livemode: boolean
  readonly merchant_amount: number
  readonly merchant_currency: string
  readonly merchant_data: Models.IssuingAuthorizationMerchantData
  readonly metadata: Readonly<Record<string, string>>
  readonly network_data: Models.IssuingTransactionNetworkData | null
  readonly object: "issuing.transaction"
  readonly purchase_details?: Models.IssuingTransactionPurchaseDetails | null
  readonly token?: string | Models.IssuingToken | null
  readonly treasury?: Models.IssuingTransactionTreasury | null
  readonly type: "capture" | "refund"
  readonly wallet: "apple_pay" | "google_pay" | "samsung_pay" | null
}

export const IssuingTransaction = Schema.Struct({
  amount: Schema.Number,
  amount_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingTransactionAmountDetails, any, any> =>
        Models.IssuingTransactionAmountDetails as Schema.Schema<Models.IssuingTransactionAmountDetails, any, any>
    )
  ),
  authorization: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.IssuingAuthorization, any, any> =>
          Models.IssuingAuthorization as Schema.Schema<Models.IssuingAuthorization, any, any>
      )
    )
  ),
  balance_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.BalanceTransaction, any, any> =>
          Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
      )
    )
  ),
  card: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCard, any, any> =>
        Models.IssuingCard as Schema.Schema<Models.IssuingCard, any, any>
    )
  ),
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
  dispute: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.IssuingDispute, any, any> =>
          Models.IssuingDispute as Schema.Schema<Models.IssuingDispute, any, any>
      )
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
      (): Schema.Schema<Models.IssuingTransactionNetworkData, any, any> =>
        Models.IssuingTransactionNetworkData as Schema.Schema<Models.IssuingTransactionNetworkData, any, any>
    )
  ),
  object: Schema.Literal("issuing.transaction"),
  purchase_details: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.IssuingTransactionPurchaseDetails, any, any> =>
          Models.IssuingTransactionPurchaseDetails as Schema.Schema<Models.IssuingTransactionPurchaseDetails, any, any>
      )
    )
  ),
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
  treasury: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.IssuingTransactionTreasury, any, any> =>
          Models.IssuingTransactionTreasury as Schema.Schema<Models.IssuingTransactionTreasury, any, any>
      )
    )
  ),
  type: Schema.Literal("capture", "refund"),
  wallet: Schema.NullOr(Schema.Literal("apple_pay", "google_pay", "samsung_pay"))
})
