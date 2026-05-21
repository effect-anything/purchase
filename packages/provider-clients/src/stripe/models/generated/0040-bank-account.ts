import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type BankAccount = {
  readonly account?: string | Models.Account | null
  readonly account_holder_name: string | null
  readonly account_holder_type: string | null
  readonly account_type: string | null
  readonly available_payout_methods?: ReadonlyArray<"instant" | "standard"> | null
  readonly bank_name: string | null
  readonly country: string
  readonly currency: string
  readonly customer?: string | Models.Customer | Models.DeletedCustomer | null
  readonly default_for_currency?: boolean | null
  readonly fingerprint: string | null
  readonly future_requirements?: Models.ExternalAccountRequirements | null
  readonly id: string
  readonly last4: string
  readonly metadata?: Readonly<Record<string, string>> | null
  readonly object: "bank_account"
  readonly requirements?: Models.ExternalAccountRequirements | null
  readonly routing_number: string | null
  readonly status: string
}

export const BankAccount = Schema.Struct({
  account: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
        )
      )
    )
  ),
  account_holder_name: Schema.NullOr(Schema.String),
  account_holder_type: Schema.NullOr(Schema.String),
  account_type: Schema.NullOr(Schema.String),
  available_payout_methods: Schema.optional(Schema.NullOr(Schema.Array(Schema.Literal("instant", "standard")))),
  bank_name: Schema.NullOr(Schema.String),
  country: Schema.String,
  currency: Schema.String,
  customer: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
        ),
        Schema.suspend(
          (): Schema.Schema<Models.DeletedCustomer, any, any> =>
            Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
        )
      )
    )
  ),
  default_for_currency: Schema.optional(Schema.NullOr(Schema.Boolean)),
  fingerprint: Schema.NullOr(Schema.String),
  future_requirements: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.ExternalAccountRequirements, any, any> =>
          Models.ExternalAccountRequirements as Schema.Schema<Models.ExternalAccountRequirements, any, any>
      )
    )
  ),
  id: Schema.String,
  last4: Schema.String,
  metadata: Schema.optional(Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String }))),
  object: Schema.Literal("bank_account"),
  requirements: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.ExternalAccountRequirements, any, any> =>
          Models.ExternalAccountRequirements as Schema.Schema<Models.ExternalAccountRequirements, any, any>
      )
    )
  ),
  routing_number: Schema.NullOr(Schema.String),
  status: Schema.String
})
