import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Adjustment = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentId, any, any> =>
      Models.AdjustmentId as Schema.Schema<Models.AdjustmentId, any, any>
  ),
  action: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentAction, any, any> =>
      Models.AdjustmentAction as Schema.Schema<Models.AdjustmentAction, any, any>
  ),
  type: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentType, any, any> =>
      Models.AdjustmentType as Schema.Schema<Models.AdjustmentType, any, any>
  ),
  transaction_id: Schema.suspend(
    (): Schema.Schema<Models.TransactionId, any, any> =>
      Models.TransactionId as Schema.Schema<Models.TransactionId, any, any>
  ),
  subscription_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionId, any, any> =>
        Models.SubscriptionId as Schema.Schema<Models.SubscriptionId, any, any>
    )
  ),
  customer_id: Schema.suspend(
    (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
  ),
  reason: Schema.String,
  credit_applied_to_balance: Schema.optional(Schema.NullOr(Schema.Boolean)),
  currency_code: Schema.suspend(
    (): Schema.Schema<Models.CurrencyCode, any, any> =>
      Models.CurrencyCode as Schema.Schema<Models.CurrencyCode, any, any>
  ),
  status: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentStatus, any, any> =>
      Models.AdjustmentStatus as Schema.Schema<Models.AdjustmentStatus, any, any>
  ),
  items: Schema.Array(
    Schema.Struct({
      id: Schema.suspend(
        (): Schema.Schema<Models.AdjustmentItemId, any, any> =>
          Models.AdjustmentItemId as Schema.Schema<Models.AdjustmentItemId, any, any>
      ),
      item_id: Schema.suspend(
        (): Schema.Schema<Models.TransactionItemId, any, any> =>
          Models.TransactionItemId as Schema.Schema<Models.TransactionItemId, any, any>
      ),
      type: Schema.suspend(
        (): Schema.Schema<Models.AdjustmentItemType, any, any> =>
          Models.AdjustmentItemType as Schema.Schema<Models.AdjustmentItemType, any, any>
      ),
      amount: Schema.NullOr(Schema.String),
      proration: Schema.NullOr(
        Schema.suspend(
          (): Schema.Schema<Models.TransactionItemProration, any, any> =>
            Models.TransactionItemProration as Schema.Schema<Models.TransactionItemProration, any, any>
        )
      ),
      totals: Schema.suspend(
        (): Schema.Schema<Models.AdjustmentItemTotals, any, any> =>
          Models.AdjustmentItemTotals as Schema.Schema<Models.AdjustmentItemTotals, any, any>
      )
    })
  ),
  totals: Schema.suspend(
    (): Schema.Schema<Models.AdjustmentTotals, any, any> =>
      Models.AdjustmentTotals as Schema.Schema<Models.AdjustmentTotals, any, any>
  ),
  payout_totals: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AdjustmentPayoutTotals, any, any> =>
        Models.AdjustmentPayoutTotals as Schema.Schema<Models.AdjustmentPayoutTotals, any, any>
    )
  ),
  tax_rates_used: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.AdjustmentTaxRatesUsed, any, any> =>
        Models.AdjustmentTaxRatesUsed as Schema.Schema<Models.AdjustmentTaxRatesUsed, any, any>
    )
  ),
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  )
})
export type Adjustment = typeof Adjustment.Type
