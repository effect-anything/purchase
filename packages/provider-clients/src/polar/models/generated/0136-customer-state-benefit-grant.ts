import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerStateBenefitGrant = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  granted_at: Schema.String,
  benefit_id: Schema.String,
  benefit_type: Schema.suspend((): typeof Models.BenefitType => Models.BenefitType),
  benefit_metadata: Schema.suspend((): typeof Models.MetadataOutputType => Models.MetadataOutputType),
  properties: Schema.Union(Schema.suspend((): typeof Models.BenefitGrantDiscordProperties => Models.BenefitGrantDiscordProperties), Schema.suspend((): typeof Models.BenefitGrantGitHubRepositoryProperties => Models.BenefitGrantGitHubRepositoryProperties), Schema.suspend((): typeof Models.BenefitGrantDownloadablesProperties => Models.BenefitGrantDownloadablesProperties), Schema.suspend((): typeof Models.BenefitGrantLicenseKeysProperties => Models.BenefitGrantLicenseKeysProperties), Schema.suspend((): typeof Models.BenefitGrantCustomProperties => Models.BenefitGrantCustomProperties), Schema.suspend((): typeof Models.BenefitGrantFeatureFlagProperties => Models.BenefitGrantFeatureFlagProperties)),
})
export type CustomerStateBenefitGrant = typeof CustomerStateBenefitGrant.Type
