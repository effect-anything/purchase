import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Benefit = Schema.Union(Schema.suspend((): typeof Models.BenefitCustom => Models.BenefitCustom), Schema.suspend((): typeof Models.BenefitDiscord => Models.BenefitDiscord), Schema.suspend((): typeof Models.BenefitGitHubRepository => Models.BenefitGitHubRepository), Schema.suspend((): typeof Models.BenefitDownloadables => Models.BenefitDownloadables), Schema.suspend((): typeof Models.BenefitLicenseKeys => Models.BenefitLicenseKeys), Schema.suspend((): typeof Models.BenefitMeterCredit => Models.BenefitMeterCredit), Schema.suspend((): typeof Models.BenefitFeatureFlag => Models.BenefitFeatureFlag))
export type Benefit = typeof Benefit.Type
