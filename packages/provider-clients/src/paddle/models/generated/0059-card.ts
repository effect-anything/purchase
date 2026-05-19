import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Card = Schema.Struct({
  type: Schema.suspend(() => Models.CardType),
  last4: Schema.suspend(() => Models.CardLast4),
  expiry_month: Schema.suspend(() => Models.CardExpiryMonth),
  expiry_year: Schema.suspend(() => Models.CardExpiryYear),
  cardholder_name: Schema.suspend(() => Models.CardCardholderName),
})
export type Card = typeof Card.Type
