import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TaxIDsOwner = Schema.Struct({
  account: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account))),
  application: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Application => Models.Application))),
  customer: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer))),
  customer_account: Schema.NullOr(Schema.String),
  type: Schema.Literal("account", "application", "customer", "self"),
})
export type TaxIDsOwner = typeof TaxIDsOwner.Type
