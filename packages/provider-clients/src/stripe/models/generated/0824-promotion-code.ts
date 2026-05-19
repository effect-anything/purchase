import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PromotionCode = Schema.Struct({
  active: Schema.Boolean,
  code: Schema.String,
  created: Schema.Number,
  customer: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer), Schema.suspend((): typeof Models.DeletedCustomer => Models.DeletedCustomer))),
  customer_account: Schema.NullOr(Schema.String),
  expires_at: Schema.NullOr(Schema.Number),
  id: Schema.String,
  livemode: Schema.Boolean,
  max_redemptions: Schema.NullOr(Schema.Number),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("promotion_code"),
  promotion: Schema.suspend((): typeof Models.PromotionCodesResourcePromotion => Models.PromotionCodesResourcePromotion),
  restrictions: Schema.suspend((): typeof Models.PromotionCodesResourceRestrictions => Models.PromotionCodesResourceRestrictions),
  times_redeemed: Schema.Number,
})
export type PromotionCode = typeof PromotionCode.Type
