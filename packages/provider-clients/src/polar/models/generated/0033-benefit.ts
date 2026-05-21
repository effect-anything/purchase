import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Benefit = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.BenefitCustom, any, any> =>
      Models.BenefitCustom as Schema.Schema<Models.BenefitCustom, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.BenefitDiscord, any, any> =>
      Models.BenefitDiscord as Schema.Schema<Models.BenefitDiscord, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.BenefitGitHubRepository, any, any> =>
      Models.BenefitGitHubRepository as Schema.Schema<Models.BenefitGitHubRepository, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.BenefitDownloadables, any, any> =>
      Models.BenefitDownloadables as Schema.Schema<Models.BenefitDownloadables, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.BenefitLicenseKeys, any, any> =>
      Models.BenefitLicenseKeys as Schema.Schema<Models.BenefitLicenseKeys, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.BenefitMeterCredit, any, any> =>
      Models.BenefitMeterCredit as Schema.Schema<Models.BenefitMeterCredit, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.BenefitFeatureFlag, any, any> =>
      Models.BenefitFeatureFlag as Schema.Schema<Models.BenefitFeatureFlag, any, any>
  )
)
export type Benefit = typeof Benefit.Type
