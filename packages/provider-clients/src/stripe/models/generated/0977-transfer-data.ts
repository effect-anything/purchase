import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransferData = Schema.Struct({
  amount: Schema.optional(Schema.Number),
  destination: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account)),
})
export type TransferData = typeof TransferData.Type
