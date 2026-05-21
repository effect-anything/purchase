import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceTransferData = Schema.Struct({
  amount: Schema.NullOr(Schema.Number),
  destination: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
    )
  )
})
export type PaymentLinksResourceTransferData = typeof PaymentLinksResourceTransferData.Type
