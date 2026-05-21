import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type TransferData = {
  readonly amount?: number
  readonly destination: string | Models.Account
}

export const TransferData = Schema.Struct({
  amount: Schema.optional(Schema.Number),
  destination: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
    )
  )
})
