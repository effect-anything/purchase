import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerPaymentMethod = Schema.Struct({
  id: Schema.suspend(() => Models.PaymentMethodId),
  customer_id: Schema.suspend(() => Models.CustomerId),
  address_id: Schema.suspend(() => Models.AddressId),
  type: Schema.suspend(() => Models.CustomerPaymentMethodType),
  card: Schema.NullOr(Schema.suspend(() => Models.Card)),
  paypal: Schema.NullOr(Schema.suspend(() => Models.Paypal)),
  underlying_details: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.UnderlyingDetails))),
  south_korea_local_card: Schema.NullOr(Schema.suspend(() => Models.SouthKoreaLocalCard)),
  origin: Schema.suspend(() => Models.CustomerPaymentMethodOrigin),
  saved_at: Schema.suspend(() => Models.SavedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
})
export type CustomerPaymentMethod = typeof CustomerPaymentMethod.Type
