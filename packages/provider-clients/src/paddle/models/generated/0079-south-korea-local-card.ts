import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SouthKoreaLocalCard = Schema.Struct({
  type: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.SouthKoreaLocalCardType> => Models.SouthKoreaLocalCardType)
  ),
  last4: Schema.optional(Schema.suspend((): Schema.Schema<Models.CardLast4> => Models.CardLast4))
})
export type SouthKoreaLocalCard = typeof SouthKoreaLocalCard.Type
