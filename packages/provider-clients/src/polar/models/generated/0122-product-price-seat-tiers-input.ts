import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceSeatTiersInput = Schema.Struct({
  seat_tier_type: Schema.optional(Schema.suspend((): typeof Models.SeatTierType => Models.SeatTierType)),
  tiers: Schema.Array(Schema.suspend((): typeof Models.ProductPriceSeatTier => Models.ProductPriceSeatTier)),
})
export type ProductPriceSeatTiersInput = typeof ProductPriceSeatTiersInput.Type
