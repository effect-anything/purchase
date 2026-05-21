import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewCreateAddress = Schema.Struct({
  customer_id: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId))
  ),
  currency_code: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CurrencyCode> => Models.CurrencyCode))
  ),
  discount_id: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.DiscountId> => Models.DiscountId))
  ),
  ignore_trials: Schema.optional(Schema.Boolean),
  items: Schema.Array(
    Schema.suspend((): Schema.Schema<Models.TransactionPreviewCreateItems> => Models.TransactionPreviewCreateItems)
  ),
  address: Schema.suspend((): Schema.Schema<Models.AddressPreviewCreate> => Models.AddressPreviewCreate)
})
export type TransactionPreviewCreateAddress = typeof TransactionPreviewCreateAddress.Type
