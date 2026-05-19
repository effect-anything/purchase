import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Account = Schema.Struct({
  business_profile: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.AccountBusinessProfile => Models.AccountBusinessProfile))),
  business_type: Schema.optional(Schema.NullOr(Schema.Literal("company", "government_entity", "individual", "non_profit"))),
  capabilities: Schema.optional(Schema.suspend((): typeof Models.AccountCapabilities => Models.AccountCapabilities)),
  charges_enabled: Schema.optional(Schema.Boolean),
  company: Schema.optional(Schema.suspend((): typeof Models.LegalEntityCompany => Models.LegalEntityCompany)),
  controller: Schema.optional(Schema.suspend((): typeof Models.AccountUnificationAccountController => Models.AccountUnificationAccountController)),
  country: Schema.optional(Schema.String),
  created: Schema.optional(Schema.Number),
  default_currency: Schema.optional(Schema.String),
  details_submitted: Schema.optional(Schema.Boolean),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  external_accounts: Schema.optional(Schema.Struct({
  data: Schema.Array(Schema.suspend((): typeof Models.ExternalAccount => Models.ExternalAccount)),
  has_more: Schema.Boolean,
  object: Schema.Literal("list"),
  url: Schema.String,
})),
  future_requirements: Schema.optional(Schema.suspend((): typeof Models.AccountFutureRequirements => Models.AccountFutureRequirements)),
  groups: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.AccountGroupMembership => Models.AccountGroupMembership))),
  id: Schema.String,
  individual: Schema.optional(Schema.suspend((): typeof Models.Person => Models.Person)),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("account"),
  payouts_enabled: Schema.optional(Schema.Boolean),
  requirements: Schema.optional(Schema.suspend((): typeof Models.AccountRequirements => Models.AccountRequirements)),
  settings: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.AccountSettings => Models.AccountSettings))),
  tos_acceptance: Schema.optional(Schema.suspend((): typeof Models.AccountTosAcceptance => Models.AccountTosAcceptance)),
  type: Schema.optional(Schema.Literal("custom", "express", "none", "standard")),
})
export type Account = typeof Account.Type
