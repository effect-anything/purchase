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
  error: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.BenefitGrantError => Models.BenefitGrantError))),
  customer: Schema.suspend((): typeof Models.Customer => Models.Customer),
  member: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.Member => Models.Member))),
  benefit: Schema.suspend((): typeof Models.Benefit => Models.Benefit),
  properties: Schema.Union(Schema.suspend((): typeof Models.BenefitGrantDiscordProperties => Models.BenefitGrantDiscordProperties), Schema.suspend((): typeof Models.BenefitGrantGitHubRepositoryProperties => Models.BenefitGrantGitHubRepositoryProperties), Schema.suspend((): typeof Models.BenefitGrantDownloadablesProperties => Models.BenefitGrantDownloadablesProperties), Schema.suspend((): typeof Models.BenefitGrantLicenseKeysProperties => Models.BenefitGrantLicenseKeysProperties), Schema.suspend((): typeof Models.BenefitGrantCustomProperties => Models.BenefitGrantCustomProperties), Schema.suspend((): typeof Models.BenefitGrantFeatureFlagProperties => Models.BenefitGrantFeatureFlagProperties)),
})
export type BenefitGrant = typeof BenefitGrant.Type
