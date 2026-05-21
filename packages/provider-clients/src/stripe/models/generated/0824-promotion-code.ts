import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type PromotionCode = {
  readonly active: boolean
  readonly code: string
  readonly created: number
  readonly customer: string | Models.Customer | Models.DeletedCustomer | null
  readonly customer_account: string | null
  readonly expires_at: number | null
  readonly id: string
  readonly livemode: boolean
  readonly max_redemptions: number | null
  readonly metadata: Readonly<Record<string, string>> | null
  readonly object: "promotion_code"
  readonly promotion: Models.PromotionCodesResourcePromotion
  readonly restrictions: Models.PromotionCodesResourceRestrictions
  readonly times_redeemed: number
}

export const PromotionCode = Schema.Struct({
  active: Schema.Boolean,
  code: Schema.String,
  created: Schema.Number,
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
  expires_at: Schema.NullOr(Schema.Number),
  id: Schema.String,
  livemode: Schema.Boolean,
  max_redemptions: Schema.NullOr(Schema.Number),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("promotion_code"),
  promotion: Schema.suspend(
    (): Schema.Schema<Models.PromotionCodesResourcePromotion, any, any> =>
      Models.PromotionCodesResourcePromotion as Schema.Schema<Models.PromotionCodesResourcePromotion, any, any>
  ),
  restrictions: Schema.suspend(
    (): Schema.Schema<Models.PromotionCodesResourceRestrictions, any, any> =>
      Models.PromotionCodesResourceRestrictions as Schema.Schema<Models.PromotionCodesResourceRestrictions, any, any>
  ),
  times_redeemed: Schema.Number
})
