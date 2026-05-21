import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerPaymentMethod = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.PaymentMethodId> => Models.PaymentMethodId),
  customer_id: Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId),
  address_id: Schema.suspend((): Schema.Schema<Models.AddressId> => Models.AddressId),
  type: Schema.suspend((): Schema.Schema<Models.CustomerPaymentMethodType> => Models.CustomerPaymentMethodType),
  card: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Card> => Models.Card)),
  paypal: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Paypal> => Models.Paypal)),
  underlying_details: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.UnderlyingDetails> => Models.UnderlyingDetails))
  ),
  south_korea_local_card: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.SouthKoreaLocalCard> => Models.SouthKoreaLocalCard)
  ),
  origin: Schema.suspend((): Schema.Schema<Models.CustomerPaymentMethodOrigin> => Models.CustomerPaymentMethodOrigin),
  saved_at: Schema.suspend((): Schema.Schema<Models.SavedAt> => Models.SavedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt)
})
export type CustomerPaymentMethod = typeof CustomerPaymentMethod.Type
