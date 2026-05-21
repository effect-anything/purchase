import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Refund = {
  readonly amount: number
  readonly balance_transaction: string | Models.BalanceTransaction | null
  readonly charge: string | Models.Charge | null
  readonly created: number
  readonly currency: string
  readonly description?: string
  readonly destination_details?: Models.RefundDestinationDetails
  readonly failure_balance_transaction?: string | Models.BalanceTransaction
  readonly failure_reason?: string
  readonly id: string
  readonly instructions_email?: string
  readonly metadata: Readonly<Record<string, string>> | null
  readonly next_action?: Models.RefundNextAction
  readonly object: "refund"
  readonly payment_intent: string | Models.PaymentIntent | null
  readonly pending_reason?: "charge_pending" | "insufficient_funds" | "processing"
  readonly presentment_details?: Models.PaymentFlowsPaymentIntentPresentmentDetails
  readonly reason: "duplicate" | "expired_uncaptured_charge" | "fraudulent" | "requested_by_customer" | null
  readonly receipt_number: string | null
  readonly source_transfer_reversal: string | Models.TransferReversal | null
  readonly status: string | null
  readonly transfer_reversal: string | Models.TransferReversal | null
}

export const Refund = Schema.Struct({
  amount: Schema.Number,
  balance_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.BalanceTransaction, any, any> =>
          Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
      )
    )
  ),
  charge: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
      )
    )
  ),
  created: Schema.Number,
  currency: Schema.String,
  description: Schema.optional(Schema.String),
  destination_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetails, any, any> =>
        Models.RefundDestinationDetails as Schema.Schema<Models.RefundDestinationDetails, any, any>
    )
  ),
  failure_balance_transaction: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.BalanceTransaction, any, any> =>
          Models.BalanceTransaction as Schema.Schema<Models.BalanceTransaction, any, any>
      )
    )
  ),
  failure_reason: Schema.optional(Schema.String),
  id: Schema.String,
  instructions_email: Schema.optional(Schema.String),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  next_action: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundNextAction, any, any> =>
        Models.RefundNextAction as Schema.Schema<Models.RefundNextAction, any, any>
    )
  ),
  object: Schema.Literal("refund"),
  payment_intent: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentIntent, any, any> =>
          Models.PaymentIntent as Schema.Schema<Models.PaymentIntent, any, any>
      )
    )
  ),
  pending_reason: Schema.optional(Schema.Literal("charge_pending", "insufficient_funds", "processing")),
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
  reason: Schema.NullOr(
    Schema.Literal("duplicate", "expired_uncaptured_charge", "fraudulent", "requested_by_customer")
  ),
  receipt_number: Schema.NullOr(Schema.String),
  source_transfer_reversal: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.TransferReversal, any, any> =>
          Models.TransferReversal as Schema.Schema<Models.TransferReversal, any, any>
      )
    )
  ),
  status: Schema.NullOr(Schema.String),
  transfer_reversal: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.TransferReversal, any, any> =>
          Models.TransferReversal as Schema.Schema<Models.TransferReversal, any, any>
      )
    )
  )
})
