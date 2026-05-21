import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Adjustment = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.AdjustmentId> => Models.AdjustmentId),
  action: Schema.suspend((): Schema.Schema<Models.AdjustmentAction> => Models.AdjustmentAction),
  type: Schema.suspend((): Schema.Schema<Models.AdjustmentType> => Models.AdjustmentType),
  transaction_id: Schema.suspend((): Schema.Schema<Models.TransactionId> => Models.TransactionId),
  subscription_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.SubscriptionId> => Models.SubscriptionId)),
  customer_id: Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId),
  reason: Schema.String,
  credit_applied_to_balance: Schema.optional(Schema.NullOr(Schema.Boolean)),
  currency_code: Schema.suspend((): Schema.Schema<Models.CurrencyCode> => Models.CurrencyCode),
  status: Schema.suspend((): Schema.Schema<Models.AdjustmentStatus> => Models.AdjustmentStatus),
  items: Schema.Array(
    Schema.Struct({
      id: Schema.suspend((): Schema.Schema<Models.AdjustmentItemId> => Models.AdjustmentItemId),
      item_id: Schema.suspend((): Schema.Schema<Models.TransactionItemId> => Models.TransactionItemId),
      type: Schema.suspend((): Schema.Schema<Models.AdjustmentItemType> => Models.AdjustmentItemType),
      amount: Schema.NullOr(Schema.String),
      proration: Schema.NullOr(
        Schema.suspend((): Schema.Schema<Models.TransactionItemProration> => Models.TransactionItemProration)
      ),
      totals: Schema.suspend((): Schema.Schema<Models.AdjustmentItemTotals> => Models.AdjustmentItemTotals)
    })
  ),
  totals: Schema.suspend((): Schema.Schema<Models.AdjustmentTotals> => Models.AdjustmentTotals),
  payout_totals: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.AdjustmentPayoutTotals> => Models.AdjustmentPayoutTotals)
  ),
  tax_rates_used: Schema.Array(
    Schema.suspend((): Schema.Schema<Models.AdjustmentTaxRatesUsed> => Models.AdjustmentTaxRatesUsed)
  ),
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt)
})
export type Adjustment = typeof Adjustment.Type
