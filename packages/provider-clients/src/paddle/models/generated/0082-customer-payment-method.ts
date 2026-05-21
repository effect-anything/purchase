import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerPaymentMethod = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.PaymentMethodId, any, any> =>
      Models.PaymentMethodId as Schema.Schema<Models.PaymentMethodId, any, any>
  ),
  customer_id: Schema.suspend(
    (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
  ),
  address_id: Schema.suspend(
    (): Schema.Schema<Models.AddressId, any, any> => Models.AddressId as Schema.Schema<Models.AddressId, any, any>
  ),
  type: Schema.suspend(
    (): Schema.Schema<Models.CustomerPaymentMethodType, any, any> =>
      Models.CustomerPaymentMethodType as Schema.Schema<Models.CustomerPaymentMethodType, any, any>
  ),
  card: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.Card, any, any> => Models.Card as Schema.Schema<Models.Card, any, any>)
  ),
  paypal: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Paypal, any, any> => Models.Paypal as Schema.Schema<Models.Paypal, any, any>
    )
  ),
  underlying_details: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.UnderlyingDetails, any, any> =>
          Models.UnderlyingDetails as Schema.Schema<Models.UnderlyingDetails, any, any>
      )
    )
  ),
  south_korea_local_card: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SouthKoreaLocalCard, any, any> =>
        Models.SouthKoreaLocalCard as Schema.Schema<Models.SouthKoreaLocalCard, any, any>
    )
  ),
  origin: Schema.suspend(
    (): Schema.Schema<Models.CustomerPaymentMethodOrigin, any, any> =>
      Models.CustomerPaymentMethodOrigin as Schema.Schema<Models.CustomerPaymentMethodOrigin, any, any>
  ),
  saved_at: Schema.suspend(
    (): Schema.Schema<Models.SavedAt, any, any> => Models.SavedAt as Schema.Schema<Models.SavedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  )
})
export type CustomerPaymentMethod = typeof CustomerPaymentMethod.Type
