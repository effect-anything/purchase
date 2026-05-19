import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ConnectCollectionTransfer = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  destination: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account)),
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("connect_collection_transfer"),
})
export type ConnectCollectionTransfer = typeof ConnectCollectionTransfer.Type
