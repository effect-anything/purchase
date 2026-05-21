import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Level3 = Schema.Struct({
  customer_reference: Schema.optional(Schema.String),
  line_items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Level3LineItems, any, any> =>
        Models.Level3LineItems as Schema.Schema<Models.Level3LineItems, any, any>
    )
  ),
  merchant_reference: Schema.String,
  shipping_address_zip: Schema.optional(Schema.String),
  shipping_amount: Schema.optional(Schema.Number),
  shipping_from_zip: Schema.optional(Schema.String)
})
export type Level3 = typeof Level3.Type
