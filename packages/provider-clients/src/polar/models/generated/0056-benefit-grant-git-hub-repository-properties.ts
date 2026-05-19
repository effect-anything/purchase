import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BenefitGrantGitHubRepositoryProperties = Schema.Struct({
  account_id: Schema.optional(Schema.NullOr(Schema.String)),
  repository_owner: Schema.optional(Schema.String),
  repository_name: Schema.optional(Schema.String),
  permission: Schema.optional(Schema.Literal("pull", "triage", "push", "maintain", "admin")),
  granted_account_id: Schema.optional(Schema.String),
})
export type BenefitGrantGitHubRepositoryProperties = typeof BenefitGrantGitHubRepositoryProperties.Type
