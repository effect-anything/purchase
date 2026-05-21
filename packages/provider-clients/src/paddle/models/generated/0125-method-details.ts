import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MethodDetails = Schema.Struct({
  type: Schema.suspend(
    (): Schema.Schema<Models.TransactionPaymentMethodType, any, any> =>
      Models.TransactionPaymentMethodType as Schema.Schema<Models.TransactionPaymentMethodType, any, any>
  ),
  underlying_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.UnderlyingDetails, any, any> =>
        Models.UnderlyingDetails as Schema.Schema<Models.UnderlyingDetails, any, any>
    )
  ),
  south_korea_local_card: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SouthKoreaLocalCard, any, any> =>
        Models.SouthKoreaLocalCard as Schema.Schema<Models.SouthKoreaLocalCard, any, any>
    )
  ),
  card: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.Card, any, any> => Models.Card as Schema.Schema<Models.Card, any, any>)
  )
})
export type MethodDetails = typeof MethodDetails.Type
