import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingDetails = Schema.Struct({
  address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  email: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
  tax_id: Schema.NullOr(Schema.String)
})
export type BillingDetails = typeof BillingDetails.Type
