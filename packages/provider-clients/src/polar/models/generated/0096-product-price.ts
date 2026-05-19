import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPrice = Schema.Union(Schema.suspend((): typeof Models.ProductPriceFixed => Models.ProductPriceFixed), Schema.suspend((): typeof Models.ProductPriceCustom => Models.ProductPriceCustom), Schema.suspend((): typeof Models.ProductPriceFree => Models.ProductPriceFree), Schema.suspend((): typeof Models.ProductPriceSeatBased => Models.ProductPriceSeatBased), Schema.suspend((): typeof Models.ProductPriceMeteredUnit => Models.ProductPriceMeteredUnit))
export type ProductPrice = typeof ProductPrice.Type
