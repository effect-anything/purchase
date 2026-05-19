import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ChargeTransferData = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  destination: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account)),
})
export type ChargeTransferData = typeof ChargeTransferData.Type
