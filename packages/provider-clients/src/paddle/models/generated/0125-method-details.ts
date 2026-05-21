import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MethodDetails = Schema.Struct({
  type: Schema.suspend((): Schema.Schema<Models.TransactionPaymentMethodType> => Models.TransactionPaymentMethodType),
  underlying_details: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.UnderlyingDetails> => Models.UnderlyingDetails)
  ),
  south_korea_local_card: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.SouthKoreaLocalCard> => Models.SouthKoreaLocalCard)
  ),
  card: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Card> => Models.Card))
})
export type MethodDetails = typeof MethodDetails.Type
