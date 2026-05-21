import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Charge = {
  readonly amount: number
  readonly amount_captured: number
  readonly amount_refunded: number
  readonly application: string | Models.Application | null
  readonly application_fee: string | Models.ApplicationFee | null
  readonly application_fee_amount: number | null
  readonly authorization_code?: string
  readonly balance_transaction: string | Models.BalanceTransaction | null
  readonly billing_details: Models.BillingDetails
  readonly calculated_statement_descriptor: string | null
  readonly captured: boolean
  readonly created: number
  readonly currency: string
  readonly customer: string | Models.Customer | Models.DeletedCustomer | null
  readonly description: string | null
  readonly disputed: boolean
  readonly failure_balance_transaction: string | Models.BalanceTransaction | null
  readonly failure_code: string | null
  readonly failure_message: string | null
  readonly fraud_details: Models.ChargeFraudDetails | null
  readonly id: string
  readonly level3?: Models.Level3
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>>
  readonly object: "charge"
  readonly on_behalf_of: string | Models.Account | null
  readonly outcome: Models.ChargeOutcome | null
  readonly paid: boolean
  readonly payment_intent: string | Models.PaymentIntent | null
  readonly payment_method: string | null
  readonly payment_method_details: Models.PaymentMethodDetails | null
  readonly presentment_details?: Models.PaymentFlowsPaymentIntentPresentmentDetails
  readonly radar_options?: Models.RadarRadarOptions
  readonly receipt_email: string | null
  readonly receipt_number: string | null
  readonly receipt_url: string | null
  readonly refunded: boolean
  readonly refunds?: {
    readonly data: ReadonlyArray<Models.Refund>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  } | null
  readonly review: string | Models.Review | null
  readonly shipping: Models.Shipping | null
  readonly source: Models.PaymentSource | null
  readonly source_transfer: string | Models.Transfer | null
  readonly statement_descriptor: string | null
  readonly statement_descriptor_suffix: string | null
  readonly status: "failed" | "pending" | "succeeded"
  readonly transfer?: string | Models.Transfer
  readonly transfer_data: Models.ChargeTransferData | null
  readonly transfer_group: string | null
}

export const Charge = Schema.Struct({
  amount: Schema.Number,
  amount_captured: Schema.Number,
  amount_refunded: Schema.Number,
  application: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Application, any, any> =>
          Models.Application as Schema.Schema<Models.Application, any, any>
      )
    )
  ),
  application_fee: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.ApplicationFee, any, any> =>
          Models.ApplicationFee as Schema.Schema<Models.ApplicationFee, any, any>
      )
    )
  ),
  application_fee_amount: Schema.NullOr(Schema.Number),
  authorization_code: Schema.optional(Schema.String),
  balance_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.BalanceTransaction, any, any> =>
          Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
      )
    )
  ),
  billing_details: Schema.suspend(
    (): Schema.Schema<Models.BillingDetails, any, any> =>
      Models.BillingDetails as Schema.Schema<Models.BillingDetails, any, any>
  ),
  calculated_statement_descriptor: Schema.NullOr(Schema.String),
  captured: Schema.Boolean,
  created: Schema.Number,
  currency: Schema.String,
  customer: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedCustomer, any, any> =>
          Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
      )
    )
  ),
  description: Schema.NullOr(Schema.String),
  disputed: Schema.Boolean,
  failure_balance_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.BalanceTransaction, any, any> =>
          Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
      )
    )
  ),
  failure_code: Schema.NullOr(Schema.String),
  failure_message: Schema.NullOr(Schema.String),
  fraud_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ChargeFraudDetails, any, any> =>
        Models.ChargeFraudDetails as Schema.Schema<Models.ChargeFraudDetails, any, any>
    )
  ),
  id: Schema.String,
  level3: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Level3, any, any> => Models.Level3 as Schema.Schema<Models.Level3, any, any>
    )
  ),
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("charge"),
  on_behalf_of: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  outcome: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ChargeOutcome, any, any> =>
        Models.ChargeOutcome as Schema.Schema<Models.ChargeOutcome, any, any>
    )
  ),
  paid: Schema.Boolean,
  payment_intent: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentIntent, any, any> =>
          Models.PaymentIntent as Schema.Schema<Models.PaymentIntent, any, any>
      )
    )
  ),
  payment_method: Schema.NullOr(Schema.String),
  payment_method_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetails, any, any> =>
        Models.PaymentMethodDetails as Schema.Schema<Models.PaymentMethodDetails, any, any>
    )
  ),
  presentment_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPaymentIntentPresentmentDetails, any, any> =>
        Models.PaymentFlowsPaymentIntentPresentmentDetails as Schema.Schema<
          Models.PaymentFlowsPaymentIntentPresentmentDetails,
          any,
          any
        >
    )
  ),
  radar_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RadarRadarOptions, any, any> =>
        Models.RadarRadarOptions as Schema.Schema<Models.RadarRadarOptions, any, any>
    )
  ),
  receipt_email: Schema.NullOr(Schema.String),
  receipt_number: Schema.NullOr(Schema.String),
  receipt_url: Schema.NullOr(Schema.String),
  refunded: Schema.Boolean,
  refunds: Schema.optional(
    Schema.NullOr(
      Schema.Struct({
        data: Schema.Array(
          Schema.suspend(
            (): Schema.Schema<Models.Refund, any, any> => Models.Refund as Schema.Schema<Models.Refund, any, any>
          )
        ),
        has_more: Schema.Boolean,
        object: Schema.Literal("list"),
        url: Schema.String
      })
    )
  ),
  review: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Review, any, any> => Models.Review as Schema.Schema<Models.Review, any, any>
      )
    )
  ),
  shipping: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Shipping, any, any> => Models.Shipping as Schema.Schema<Models.Shipping, any, any>
    )
  ),
  source: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentSource, any, any> =>
        Models.PaymentSource as Schema.Schema<Models.PaymentSource, any, any>
    )
  ),
  source_transfer: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Transfer, any, any> => Models.Transfer as Schema.Schema<Models.Transfer, any, any>
      )
    )
  ),
  statement_descriptor: Schema.NullOr(Schema.String),
  statement_descriptor_suffix: Schema.NullOr(Schema.String),
  status: Schema.Literal("failed", "pending", "succeeded"),
  transfer: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Transfer, any, any> => Models.Transfer as Schema.Schema<Models.Transfer, any, any>
      )
    )
  ),
  transfer_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ChargeTransferData, any, any> =>
        Models.ChargeTransferData as Schema.Schema<Models.ChargeTransferData, any, any>
    )
  ),
  transfer_group: Schema.NullOr(Schema.String)
})
