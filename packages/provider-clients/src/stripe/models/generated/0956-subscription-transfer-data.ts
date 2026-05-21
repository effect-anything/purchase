import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SubscriptionTransferData = {
  readonly amount_percent: number | null
  readonly destination: string | Models.Account
}

export const SubscriptionTransferData = Schema.Struct({
  amount_percent: Schema.NullOr(Schema.Number),
  destination: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
    )
  )
})
