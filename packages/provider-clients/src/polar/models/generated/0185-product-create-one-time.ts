import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductCreateOneTime = Schema.Struct({
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  visibility: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.ProductVisibility, any, any> =>
        Models.ProductVisibility as Schema.Schema<Models.ProductVisibility, any, any>
    )
  ),
  prices: Schema.Array(
    Schema.Union(
      Schema.suspend(
        (): Schema.Schema<Models.ProductPriceFixedCreate, any, any> =>
          Models.ProductPriceFixedCreate as Schema.Schema<Models.ProductPriceFixedCreate, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.ProductPriceCustomCreate, any, any> =>
          Models.ProductPriceCustomCreate as Schema.Schema<Models.ProductPriceCustomCreate, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.ProductPriceFreeCreate, any, any> =>
          Models.ProductPriceFreeCreate as Schema.Schema<Models.ProductPriceFreeCreate, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.ProductPriceSeatBasedCreate, any, any> =>
          Models.ProductPriceSeatBasedCreate as Schema.Schema<Models.ProductPriceSeatBasedCreate, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.ProductPriceMeteredUnitCreate, any, any> =>
          Models.ProductPriceMeteredUnitCreate as Schema.Schema<Models.ProductPriceMeteredUnitCreate, any, any>
      )
    )
  ),
  medias: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
  attached_custom_fields: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.AttachedCustomFieldCreate, any, any> =>
          Models.AttachedCustomFieldCreate as Schema.Schema<Models.AttachedCustomFieldCreate, any, any>
      )
    )
  ),
  organization_id: Schema.optional(Schema.NullOr(Schema.String)),
  recurring_interval: Schema.optional(Schema.Unknown),
  recurring_interval_count: Schema.optional(Schema.Unknown)
})
export type ProductCreateOneTime = typeof ProductCreateOneTime.Type
