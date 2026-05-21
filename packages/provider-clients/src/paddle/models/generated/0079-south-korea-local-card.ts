import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SouthKoreaLocalCard = Schema.Struct({
  type: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SouthKoreaLocalCardType, any, any> =>
        Models.SouthKoreaLocalCardType as Schema.Schema<Models.SouthKoreaLocalCardType, any, any>
    )
  ),
  last4: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CardLast4, any, any> => Models.CardLast4 as Schema.Schema<Models.CardLast4, any, any>
    )
  )
})
export type SouthKoreaLocalCard = typeof SouthKoreaLocalCard.Type
