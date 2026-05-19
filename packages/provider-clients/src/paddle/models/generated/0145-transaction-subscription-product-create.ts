import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionSubscriptionProductCreate = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  tax_category: Schema.suspend(() => Models.TaxCategory),
  image_url: Schema.optional(Schema.NullOr(Schema.Union(Schema.suspend(() => Models.ImageUrl), Schema.suspend(() => Models.EmptyString)))),
  custom_data: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.CustomData))),
})
export type TransactionSubscriptionProductCreate = typeof TransactionSubscriptionProductCreate.Type
