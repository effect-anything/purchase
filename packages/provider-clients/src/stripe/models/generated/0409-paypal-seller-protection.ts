import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaypalSellerProtection = Schema.Struct({
  dispute_categories: Schema.NullOr(Schema.Array(Schema.Literal("fraudulent", "product_not_received"))),
  status: Schema.Literal("eligible", "not_eligible", "partially_eligible")
})
export type PaypalSellerProtection = typeof PaypalSellerProtection.Type
