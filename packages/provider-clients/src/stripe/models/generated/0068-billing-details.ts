import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingDetails = Schema.Struct({
  address: Schema.NullOr(Schema.suspend((): typeof Models.Address => Models.Address)),
  email: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
  tax_id: Schema.NullOr(Schema.String),
})
export type BillingDetails = typeof BillingDetails.Type
