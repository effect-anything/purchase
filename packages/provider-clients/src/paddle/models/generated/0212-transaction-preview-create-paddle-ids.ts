import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPreviewCreatePaddleIds = Schema.Struct({
  currency_code: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.CurrencyCode))),
  discount_id: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.DiscountId))),
  ignore_trials: Schema.optional(Schema.Boolean),
  items: Schema.Array(Schema.suspend(() => Models.TransactionPreviewCreateItems)),
  customer_id: Schema.suspend(() => Models.CustomerId),
  address_id: Schema.suspend(() => Models.AddressId),
  business_id: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.BusinessId))),
})
export type TransactionPreviewCreatePaddleIds = typeof TransactionPreviewCreatePaddleIds.Type
