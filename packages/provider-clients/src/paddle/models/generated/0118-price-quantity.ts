import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PriceQuantity = Schema.Struct({
  minimum: Schema.Number,
  maximum: Schema.Number
})
export type PriceQuantity = typeof PriceQuantity.Type
