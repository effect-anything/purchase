import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionSubscriptionProductCreate = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  tax_category: Schema.suspend(
    (): Schema.Schema<Models.TaxCategory, any, any> => Models.TaxCategory as Schema.Schema<Models.TaxCategory, any, any>
  ),
  image_url: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.suspend(
          (): Schema.Schema<Models.ImageUrl, any, any> => Models.ImageUrl as Schema.Schema<Models.ImageUrl, any, any>
        ),
        Schema.suspend(
          (): Schema.Schema<Models.EmptyString, any, any> =>
            Models.EmptyString as Schema.Schema<Models.EmptyString, any, any>
        )
      )
    )
  ),
  custom_data: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.CustomData, any, any> =>
          Models.CustomData as Schema.Schema<Models.CustomData, any, any>
      )
    )
  )
})
export type TransactionSubscriptionProductCreate = typeof TransactionSubscriptionProductCreate.Type
