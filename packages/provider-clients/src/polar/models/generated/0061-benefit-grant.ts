import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitGrant = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  granted_at: Schema.optional(Schema.NullOr(Schema.String)),
  is_granted: Schema.Boolean,
  revoked_at: Schema.optional(Schema.NullOr(Schema.String)),
  is_revoked: Schema.Boolean,
  subscription_id: Schema.NullOr(Schema.String),
  order_id: Schema.NullOr(Schema.String),
  customer_id: Schema.String,
  member_id: Schema.optional(Schema.NullOr(Schema.String)),
  benefit_id: Schema.String,
  error: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.BenefitGrantError, any, any> =>
          Models.BenefitGrantError as Schema.Schema<Models.BenefitGrantError, any, any>
      )
    )
  ),
  customer: Schema.suspend(
    (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
  ),
  member: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.Member, any, any> => Models.Member as Schema.Schema<Models.Member, any, any>
      )
    )
  ),
  benefit: Schema.suspend(
    (): Schema.Schema<Models.Benefit, any, any> => Models.Benefit as Schema.Schema<Models.Benefit, any, any>
  ),
  properties: Schema.Union(
    Schema.suspend(
      (): Schema.Schema<Models.BenefitGrantDiscordProperties, any, any> =>
        Models.BenefitGrantDiscordProperties as Schema.Schema<Models.BenefitGrantDiscordProperties, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.BenefitGrantGitHubRepositoryProperties, any, any> =>
        Models.BenefitGrantGitHubRepositoryProperties as Schema.Schema<
          Models.BenefitGrantGitHubRepositoryProperties,
          any,
          any
        >
    ),
    Schema.suspend(
      (): Schema.Schema<Models.BenefitGrantDownloadablesProperties, any, any> =>
        Models.BenefitGrantDownloadablesProperties as Schema.Schema<
          Models.BenefitGrantDownloadablesProperties,
          any,
          any
        >
    ),
    Schema.suspend(
      (): Schema.Schema<Models.BenefitGrantLicenseKeysProperties, any, any> =>
        Models.BenefitGrantLicenseKeysProperties as Schema.Schema<Models.BenefitGrantLicenseKeysProperties, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.BenefitGrantCustomProperties, any, any> =>
        Models.BenefitGrantCustomProperties as Schema.Schema<Models.BenefitGrantCustomProperties, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.BenefitGrantFeatureFlagProperties, any, any> =>
        Models.BenefitGrantFeatureFlagProperties as Schema.Schema<Models.BenefitGrantFeatureFlagProperties, any, any>
    )
  )
})
export type BenefitGrant = typeof BenefitGrant.Type
