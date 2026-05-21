import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type ChargeTransferData = {
  readonly amount: number | null
  readonly destination: string | Models.Account
}

export const ChargeTransferData = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  destination: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
    )
  )
})
