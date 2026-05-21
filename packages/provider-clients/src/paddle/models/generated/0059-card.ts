import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Card = Schema.Struct({
  type: Schema.suspend(
    (): Schema.Schema<Models.CardType, any, any> => Models.CardType as Schema.Schema<Models.CardType, any, any>
  ),
  last4: Schema.suspend(
    (): Schema.Schema<Models.CardLast4, any, any> => Models.CardLast4 as Schema.Schema<Models.CardLast4, any, any>
  ),
  expiry_month: Schema.suspend(
    (): Schema.Schema<Models.CardExpiryMonth, any, any> =>
      Models.CardExpiryMonth as Schema.Schema<Models.CardExpiryMonth, any, any>
  ),
  expiry_year: Schema.suspend(
    (): Schema.Schema<Models.CardExpiryYear, any, any> =>
      Models.CardExpiryYear as Schema.Schema<Models.CardExpiryYear, any, any>
  ),
  cardholder_name: Schema.suspend(
    (): Schema.Schema<Models.CardCardholderName, any, any> =>
      Models.CardCardholderName as Schema.Schema<Models.CardCardholderName, any, any>
  )
})
export type Card = typeof Card.Type
