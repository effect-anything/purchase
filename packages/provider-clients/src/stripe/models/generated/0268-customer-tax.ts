import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerTax = Schema.Struct({
  automatic_tax: Schema.Literal("failed", "not_collecting", "supported", "unrecognized_location"),
  ip_address: Schema.NullOr(Schema.String),
  location: Schema.NullOr(Schema.suspend((): typeof Models.CustomerTaxLocation => Models.CustomerTaxLocation)),
  provider: Schema.Literal("anrok", "avalara", "sphere", "stripe"),
})
export type CustomerTax = typeof CustomerTax.Type
