import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionSubscriptionProductCreate = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  tax_category: Schema.suspend((): Schema.Schema<Models.TaxCategory> => Models.TaxCategory),
  image_url: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.suspend((): Schema.Schema<Models.ImageUrl> => Models.ImageUrl),
        Schema.suspend((): Schema.Schema<Models.EmptyString> => Models.EmptyString)
      )
    )
  ),
  custom_data: Schema.optional(Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData)))
})
export type TransactionSubscriptionProductCreate = typeof TransactionSubscriptionProductCreate.Type
