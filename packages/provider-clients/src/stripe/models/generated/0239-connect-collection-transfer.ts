import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type ConnectCollectionTransfer = {
  readonly amount: number
  readonly currency: string
  readonly destination: string | Models.Account
  readonly id: string
  readonly livemode: boolean
  readonly object: "connect_collection_transfer"
}

export const ConnectCollectionTransfer = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  destination: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
    )
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("connect_collection_transfer")
})
