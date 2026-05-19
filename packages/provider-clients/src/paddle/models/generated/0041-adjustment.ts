import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Adjustment = Schema.Struct({
  id: Schema.suspend(() => Models.AdjustmentId),
  action: Schema.suspend(() => Models.AdjustmentAction),
  type: Schema.suspend(() => Models.AdjustmentType),
  transaction_id: Schema.suspend(() => Models.TransactionId),
  subscription_id: Schema.NullOr(Schema.suspend(() => Models.SubscriptionId)),
  customer_id: Schema.suspend(() => Models.CustomerId),
  reason: Schema.String,
  credit_applied_to_balance: Schema.optional(Schema.NullOr(Schema.Boolean)),
  currency_code: Schema.suspend(() => Models.CurrencyCode),
  status: Schema.suspend(() => Models.AdjustmentStatus),
  items: Schema.Array(Schema.Struct({
  id: Schema.suspend(() => Models.AdjustmentItemId),
  item_id: Schema.suspend(() => Models.TransactionItemId),
  type: Schema.suspend(() => Models.AdjustmentItemType),
  amount: Schema.NullOr(Schema.String),
  proration: Schema.NullOr(Schema.suspend(() => Models.TransactionItemProration)),
  totals: Schema.suspend(() => Models.AdjustmentItemTotals),
})),
  totals: Schema.suspend(() => Models.AdjustmentTotals),
  payout_totals: Schema.NullOr(Schema.suspend(() => Models.AdjustmentPayoutTotals)),
  tax_rates_used: Schema.Array(Schema.suspend(() => Models.AdjustmentTaxRatesUsed)),
  created_at: Schema.suspend(() => Models.CreatedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
})
export type Adjustment = typeof Adjustment.Type
