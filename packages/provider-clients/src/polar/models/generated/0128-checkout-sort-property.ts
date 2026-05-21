import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutSortProperty = Schema.Literal(
  "created_at",
  "-created_at",
  "expires_at",
  "-expires_at",
  "status",
  "-status"
)
export type CheckoutSortProperty = typeof CheckoutSortProperty.Type
