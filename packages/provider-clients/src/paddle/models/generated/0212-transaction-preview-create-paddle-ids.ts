import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewCreatePaddleIds = Schema.Struct({
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
  customer_id: Schema.suspend(
    (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
  ),
  address_id: Schema.suspend(
    (): Schema.Schema<Models.AddressId, any, any> => Models.AddressId as Schema.Schema<Models.AddressId, any, any>
  ),
  business_id: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.BusinessId, any, any> =>
          Models.BusinessId as Schema.Schema<Models.BusinessId, any, any>
      )
    )
  )
})
export type TransactionPreviewCreatePaddleIds = typeof TransactionPreviewCreatePaddleIds.Type
