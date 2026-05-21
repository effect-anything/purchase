import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Card = Schema.Struct({
  type: Schema.suspend((): Schema.Schema<Models.CardType> => Models.CardType),
  last4: Schema.suspend((): Schema.Schema<Models.CardLast4> => Models.CardLast4),
  expiry_month: Schema.suspend((): Schema.Schema<Models.CardExpiryMonth> => Models.CardExpiryMonth),
  expiry_year: Schema.suspend((): Schema.Schema<Models.CardExpiryYear> => Models.CardExpiryYear),
  cardholder_name: Schema.suspend((): Schema.Schema<Models.CardCardholderName> => Models.CardCardholderName)
})
export type Card = typeof Card.Type
