import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SouthKoreaLocalCard = Schema.Struct({
  type: Schema.optional(Schema.suspend(() => Models.SouthKoreaLocalCardType)),
  last4: Schema.optional(Schema.suspend(() => Models.CardLast4)),
})
export type SouthKoreaLocalCard = typeof SouthKoreaLocalCard.Type
