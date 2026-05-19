import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MethodDetails = Schema.Struct({
  type: Schema.suspend(() => Models.TransactionPaymentMethodType),
  underlying_details: Schema.NullOr(Schema.suspend(() => Models.UnderlyingDetails)),
  south_korea_local_card: Schema.NullOr(Schema.suspend(() => Models.SouthKoreaLocalCard)),
  card: Schema.NullOr(Schema.suspend(() => Models.Card)),
})
export type MethodDetails = typeof MethodDetails.Type
