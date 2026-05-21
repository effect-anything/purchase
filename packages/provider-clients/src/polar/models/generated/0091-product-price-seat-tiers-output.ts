import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductPriceSeatTiersOutput = Schema.Struct({
  seat_tier_type: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SeatTierType, any, any> =>
        Models.SeatTierType as Schema.Schema<Models.SeatTierType, any, any>
    )
  ),
  tiers: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.ProductPriceSeatTier, any, any> =>
        Models.ProductPriceSeatTier as Schema.Schema<Models.ProductPriceSeatTier, any, any>
    )
  ),
  minimum_seats: Schema.Number,
  maximum_seats: Schema.NullOr(Schema.Number)
})
export type ProductPriceSeatTiersOutput = typeof ProductPriceSeatTiersOutput.Type
