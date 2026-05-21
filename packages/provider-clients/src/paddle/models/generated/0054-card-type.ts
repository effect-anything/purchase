import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CardType = Schema.Literal(
  "american_express",
  "diners_club",
  "discover",
  "jcb",
  "mada",
  "maestro",
  "mastercard",
  "union_pay",
  "unknown",
  "visa"
)
export type CardType = typeof CardType.Type
