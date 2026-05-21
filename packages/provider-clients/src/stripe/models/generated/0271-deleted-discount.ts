import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type DeletedDiscount = {
  readonly checkout_session: string | null
  readonly customer: string | Models.Customer | Models.DeletedCustomer | null
  readonly customer_account: string | null
  readonly deleted: true
  readonly id: string
  readonly invoice: string | null
  readonly invoice_item: string | null
  readonly object: "discount"
  readonly promotion_code: string | Models.PromotionCode | null
  readonly source: Models.DiscountSource
  readonly start: number
  readonly subscription: string | null
  readonly subscription_item: string | null
}

export const DeletedDiscount = Schema.Struct({
  checkout_session: Schema.NullOr(Schema.String),
  customer: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedCustomer, any, any> =>
          Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
      )
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  deleted: Schema.Literal(true),
  id: Schema.String,
  invoice: Schema.NullOr(Schema.String),
  invoice_item: Schema.NullOr(Schema.String),
  object: Schema.Literal("discount"),
  promotion_code: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PromotionCode, any, any> =>
          Models.PromotionCode as Schema.Schema<Models.PromotionCode, any, any>
      )
    )
  ),
  source: Schema.suspend(
    (): Schema.Schema<Models.DiscountSource, any, any> =>
      Models.DiscountSource as Schema.Schema<Models.DiscountSource, any, any>
  ),
  start: Schema.Number,
  subscription: Schema.NullOr(Schema.String),
  subscription_item: Schema.NullOr(Schema.String)
})
