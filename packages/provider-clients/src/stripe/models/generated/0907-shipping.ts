import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Shipping = Schema.Struct({
  address: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  carrier: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.optional(Schema.String),
  phone: Schema.optional(Schema.NullOr(Schema.String)),
  tracking_number: Schema.optional(Schema.NullOr(Schema.String))
})
export type Shipping = typeof Shipping.Type
