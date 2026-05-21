import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountBusinessProfile = Schema.Struct({
  annual_revenue: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.AccountAnnualRevenue, any, any> =>
          Models.AccountAnnualRevenue as Schema.Schema<Models.AccountAnnualRevenue, any, any>
      )
    )
  ),
  estimated_worker_count: Schema.optional(Schema.NullOr(Schema.Number)),
  mcc: Schema.NullOr(Schema.String),
  minority_owned_business_designation: Schema.NullOr(
    Schema.Array(
      Schema.Literal(
        "lgbtqi_owned_business",
        "minority_owned_business",
        "none_of_these_apply",
        "prefer_not_to_answer",
        "women_owned_business"
      )
    )
  ),
  monthly_estimated_revenue: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountMonthlyEstimatedRevenue, any, any> =>
        Models.AccountMonthlyEstimatedRevenue as Schema.Schema<Models.AccountMonthlyEstimatedRevenue, any, any>
    )
  ),
  name: Schema.NullOr(Schema.String),
  product_description: Schema.optional(Schema.NullOr(Schema.String)),
  support_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  support_email: Schema.NullOr(Schema.String),
  support_phone: Schema.NullOr(Schema.String),
  support_url: Schema.NullOr(Schema.String),
  url: Schema.NullOr(Schema.String)
})
export type AccountBusinessProfile = typeof AccountBusinessProfile.Type
