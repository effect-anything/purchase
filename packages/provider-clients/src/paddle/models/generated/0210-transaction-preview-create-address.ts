import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewCreateAddress = Schema.Struct({
  customer_id: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.CustomerId, any, any> =>
          Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
      )
    )
  ),
  currency_code: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.CurrencyCode, any, any> =>
          Models.CurrencyCode as Schema.Schema<Models.CurrencyCode, any, any>
      )
    )
  ),
  discount_id: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.DiscountId, any, any> =>
          Models.DiscountId as Schema.Schema<Models.DiscountId, any, any>
      )
    )
  ),
  ignore_trials: Schema.optional(Schema.Boolean),
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionPreviewCreateItems, any, any> =>
        Models.TransactionPreviewCreateItems as Schema.Schema<Models.TransactionPreviewCreateItems, any, any>
    )
  ),
  address: Schema.suspend(
    (): Schema.Schema<Models.AddressPreviewCreate, any, any> =>
      Models.AddressPreviewCreate as Schema.Schema<Models.AddressPreviewCreate, any, any>
  )
})
export type TransactionPreviewCreateAddress = typeof TransactionPreviewCreateAddress.Type
