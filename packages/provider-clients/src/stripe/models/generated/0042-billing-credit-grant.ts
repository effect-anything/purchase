import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditGrant = Schema.Struct({
  amount: Schema.suspend((): typeof Models.BillingCreditGrantsResourceAmount => Models.BillingCreditGrantsResourceAmount),
  applicability_config: Schema.suspend((): typeof Models.BillingCreditGrantsResourceApplicabilityConfig => Models.BillingCreditGrantsResourceApplicabilityConfig),
  category: Schema.Literal("paid", "promotional"),
  created: Schema.Number,
  customer: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer), Schema.suspend((): typeof Models.DeletedCustomer => Models.DeletedCustomer)),
  customer_account: Schema.NullOr(Schema.String),
  effective_at: Schema.NullOr(Schema.Number),
  expires_at: Schema.NullOr(Schema.Number),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name: Schema.NullOr(Schema.String),
  object: Schema.Literal("billing.credit_grant"),
  priority: Schema.optional(Schema.NullOr(Schema.Number)),
  test_clock: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TestHelpersTestClock => Models.TestHelpersTestClock))),
  updated: Schema.Number,
  voided_at: Schema.NullOr(Schema.Number),
})
export type BillingCreditGrant = typeof BillingCreditGrant.Type
