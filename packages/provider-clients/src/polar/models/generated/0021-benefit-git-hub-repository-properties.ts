import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitGitHubRepositoryProperties = Schema.Struct({
  repository_owner: Schema.String,
  repository_name: Schema.String,
  permission: Schema.Literal("pull", "triage", "push", "maintain", "admin")
})
export type BenefitGitHubRepositoryProperties = typeof BenefitGitHubRepositoryProperties.Type
