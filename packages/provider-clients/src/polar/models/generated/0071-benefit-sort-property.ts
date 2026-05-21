import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitSortProperty = Schema.Literal(
  "created_at",
  "-created_at",
  "description",
  "-description",
  "type",
  "-type",
  "user_order",
  "-user_order"
)
export type BenefitSortProperty = typeof BenefitSortProperty.Type
