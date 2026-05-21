import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerStateBenefitGrant = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  granted_at: Schema.String,
  benefit_id: Schema.String,
  benefit_type: Schema.suspend(
    (): Schema.Schema<Models.BenefitType, any, any> => Models.BenefitType as Schema.Schema<Models.BenefitType, any, any>
  ),
  benefit_metadata: Schema.suspend(
    (): Schema.Schema<Models.MetadataOutputType, any, any> =>
      Models.MetadataOutputType as Schema.Schema<Models.MetadataOutputType, any, any>
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
export type CustomerStateBenefitGrant = typeof CustomerStateBenefitGrant.Type
