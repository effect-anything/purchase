import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutCreateAttributes = Schema.Struct({
  custom_price: Schema.optional(Schema.Number),
  product_options: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  checkout_options: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  checkout_data: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  preview: Schema.optional(Schema.Boolean),
  test_mode: Schema.optional(Schema.Boolean)
})
export type CheckoutCreateAttributes = typeof CheckoutCreateAttributes.Type
