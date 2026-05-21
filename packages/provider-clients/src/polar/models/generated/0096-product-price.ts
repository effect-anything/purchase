import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductPrice = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.ProductPriceFixed, any, any> =>
      Models.ProductPriceFixed as Schema.Schema<Models.ProductPriceFixed, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.ProductPriceCustom, any, any> =>
      Models.ProductPriceCustom as Schema.Schema<Models.ProductPriceCustom, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.ProductPriceFree, any, any> =>
      Models.ProductPriceFree as Schema.Schema<Models.ProductPriceFree, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.ProductPriceSeatBased, any, any> =>
      Models.ProductPriceSeatBased as Schema.Schema<Models.ProductPriceSeatBased, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.ProductPriceMeteredUnit, any, any> =>
      Models.ProductPriceMeteredUnit as Schema.Schema<Models.ProductPriceMeteredUnit, any, any>
  )
)
export type ProductPrice = typeof ProductPrice.Type
