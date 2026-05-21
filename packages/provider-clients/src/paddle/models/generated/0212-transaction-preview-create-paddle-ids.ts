import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewCreatePaddleIds = Schema.Struct({
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
  customer_id: Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId),
  address_id: Schema.suspend((): Schema.Schema<Models.AddressId> => Models.AddressId),
  business_id: Schema.optional(Schema.NullOr(Schema.suspend((): Schema.Schema<Models.BusinessId> => Models.BusinessId)))
})
export type TransactionPreviewCreatePaddleIds = typeof TransactionPreviewCreatePaddleIds.Type
