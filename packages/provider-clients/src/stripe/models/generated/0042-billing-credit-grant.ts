import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type BillingCreditGrant = {
  readonly amount: Models.BillingCreditGrantsResourceAmount
  readonly applicability_config: Models.BillingCreditGrantsResourceApplicabilityConfig
  readonly category: "paid" | "promotional"
  readonly created: number
  readonly customer: string | Models.Customer | Models.DeletedCustomer
  readonly customer_account: string | null
  readonly effective_at: number | null
  readonly expires_at: number | null
  readonly id: string
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>>
  readonly name: string | null
  readonly object: "billing.credit_grant"
  readonly priority?: number | null
  readonly test_clock: string | Models.TestHelpersTestClock | null
  readonly updated: number
  readonly voided_at: number | null
}

export const BillingCreditGrant = Schema.Struct({
  amount: Schema.suspend(
    (): Schema.Schema<Models.BillingCreditGrantsResourceAmount, any, any> =>
      Models.BillingCreditGrantsResourceAmount as Schema.Schema<Models.BillingCreditGrantsResourceAmount, any, any>
  ),
  applicability_config: Schema.suspend(
    (): Schema.Schema<Models.BillingCreditGrantsResourceApplicabilityConfig, any, any> =>
      Models.BillingCreditGrantsResourceApplicabilityConfig as Schema.Schema<
        Models.BillingCreditGrantsResourceApplicabilityConfig,
        any,
        any
      >
  ),
  category: Schema.Literal("paid", "promotional"),
  created: Schema.Number,
  customer: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.DeletedCustomer, any, any> =>
        Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  effective_at: Schema.NullOr(Schema.Number),
  expires_at: Schema.NullOr(Schema.Number),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name: Schema.NullOr(Schema.String),
  object: Schema.Literal("billing.credit_grant"),
  priority: Schema.optional(Schema.NullOr(Schema.Number)),
  test_clock: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.TestHelpersTestClock, any, any> =>
          Models.TestHelpersTestClock as Schema.Schema<Models.TestHelpersTestClock, any, any>
      )
    )
  ),
  updated: Schema.Number,
  voided_at: Schema.NullOr(Schema.Number)
})
