import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitType = Schema.Literal(
  "custom",
  "discord",
  "github_repository",
  "downloadables",
  "license_keys",
  "meter_credit",
  "feature_flag"
)
export type BenefitType = typeof BenefitType.Type
