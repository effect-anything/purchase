import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPreviewCreateIpAddress = Schema.Struct({
  customer_id: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.CustomerId))),
  currency_code: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.CurrencyCode))),
  discount_id: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.DiscountId))),
  ignore_trials: Schema.optional(Schema.Boolean),
  items: Schema.Array(Schema.suspend(() => Models.TransactionPreviewCreateItems)),
  customer_ip_address: Schema.String,
})
export type TransactionPreviewCreateIpAddress = typeof TransactionPreviewCreateIpAddress.Type
