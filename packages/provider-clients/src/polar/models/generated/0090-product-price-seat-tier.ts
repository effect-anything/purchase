import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceSeatTier = Schema.Struct({
  min_seats: Schema.Number,
  max_seats: Schema.optional(Schema.NullOr(Schema.Number)),
  price_per_seat: Schema.Number,
})
export type ProductPriceSeatTier = typeof ProductPriceSeatTier.Type
