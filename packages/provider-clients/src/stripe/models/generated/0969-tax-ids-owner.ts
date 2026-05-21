import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type TaxIDsOwner = {
  readonly account?: string | Models.Account
  readonly application?: string | Models.Application
  readonly customer?: string | Models.Customer
  readonly customer_account: string | null
  readonly type: "account" | "application" | "customer" | "self"
}

export const TaxIDsOwner = Schema.Struct({
  account: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  application: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Application, any, any> =>
          Models.Application as Schema.Schema<Models.Application, any, any>
      )
    )
  ),
  customer: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
      )
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  type: Schema.Literal("account", "application", "customer", "self")
})
