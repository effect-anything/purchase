import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DeletedDiscount = Schema.Struct({
  checkout_session: Schema.NullOr(Schema.String),
  customer: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer), Schema.suspend((): typeof Models.DeletedCustomer => Models.DeletedCustomer))),
  customer_account: Schema.NullOr(Schema.String),
  deleted: Schema.Literal(true),
  id: Schema.String,
  invoice: Schema.NullOr(Schema.String),
  invoice_item: Schema.NullOr(Schema.String),
  object: Schema.Literal("discount"),
  promotion_code: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PromotionCode => Models.PromotionCode))),
  source: Schema.suspend((): typeof Models.DiscountSource => Models.DiscountSource),
  start: Schema.Number,
  subscription: Schema.NullOr(Schema.String),
  subscription_item: Schema.NullOr(Schema.String),
})
export type DeletedDiscount = typeof DeletedDiscount.Type
