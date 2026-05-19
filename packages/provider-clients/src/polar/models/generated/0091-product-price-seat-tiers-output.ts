import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceSeatTiersOutput = Schema.Struct({
  seat_tier_type: Schema.optional(Schema.suspend((): typeof Models.SeatTierType => Models.SeatTierType)),
  tiers: Schema.Array(Schema.suspend((): typeof Models.ProductPriceSeatTier => Models.ProductPriceSeatTier)),
  minimum_seats: Schema.Number,
  maximum_seats: Schema.NullOr(Schema.Number),
})
export type ProductPriceSeatTiersOutput = typeof ProductPriceSeatTiersOutput.Type
