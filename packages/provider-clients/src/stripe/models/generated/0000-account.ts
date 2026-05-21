import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Account = {
  readonly business_profile?: Models.AccountBusinessProfile | null
  readonly business_type?: "company" | "government_entity" | "individual" | "non_profit" | null
  readonly capabilities?: Models.AccountCapabilities
  readonly charges_enabled?: boolean
  readonly company?: Models.LegalEntityCompany
  readonly controller?: Models.AccountUnificationAccountController
  readonly country?: string
  readonly created?: number
  readonly default_currency?: string
  readonly details_submitted?: boolean
  readonly email?: string | null
  readonly external_accounts?: {
    readonly data: ReadonlyArray<Models.ExternalAccount>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
  readonly future_requirements?: Models.AccountFutureRequirements
  readonly groups?: Models.AccountGroupMembership | null
  readonly id: string
  readonly individual?: Models.Person
  readonly metadata?: Readonly<Record<string, string>>
  readonly object: "account"
  readonly payouts_enabled?: boolean
  readonly requirements?: Models.AccountRequirements
  readonly settings?: Models.AccountSettings | null
  readonly tos_acceptance?: Models.AccountTosAcceptance
  readonly type?: "custom" | "express" | "none" | "standard"
}

export const Account = Schema.Struct({
  business_profile: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.AccountBusinessProfile, any, any> =>
          Models.AccountBusinessProfile as Schema.Schema<Models.AccountBusinessProfile, any, any>
      )
    )
  ),
  business_type: Schema.optional(
    Schema.NullOr(Schema.Literal("company", "government_entity", "individual", "non_profit"))
  ),
  capabilities: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountCapabilities, any, any> =>
        Models.AccountCapabilities as Schema.Schema<Models.AccountCapabilities, any, any>
    )
  ),
  charges_enabled: Schema.optional(Schema.Boolean),
  company: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LegalEntityCompany, any, any> =>
        Models.LegalEntityCompany as Schema.Schema<Models.LegalEntityCompany, any, any>
    )
  ),
  controller: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountUnificationAccountController, any, any> =>
        Models.AccountUnificationAccountController as Schema.Schema<
          Models.AccountUnificationAccountController,
          any,
          any
        >
    )
  ),
  country: Schema.optional(Schema.String),
  created: Schema.optional(Schema.Number),
  default_currency: Schema.optional(Schema.String),
  details_submitted: Schema.optional(Schema.Boolean),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  external_accounts: Schema.optional(
    Schema.Struct({
      data: Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.ExternalAccount, any, any> =>
            Models.ExternalAccount as Schema.Schema<Models.ExternalAccount, any, any>
        )
      ),
      has_more: Schema.Boolean,
      object: Schema.Literal("list"),
      url: Schema.String
    })
  ),
  future_requirements: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountFutureRequirements, any, any> =>
        Models.AccountFutureRequirements as Schema.Schema<Models.AccountFutureRequirements, any, any>
    )
  ),
  groups: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.AccountGroupMembership, any, any> =>
          Models.AccountGroupMembership as Schema.Schema<Models.AccountGroupMembership, any, any>
      )
    )
  ),
  id: Schema.String,
  individual: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Person, any, any> => Models.Person as Schema.Schema<Models.Person, any, any>
    )
  ),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("account"),
  payouts_enabled: Schema.optional(Schema.Boolean),
  requirements: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountRequirements, any, any> =>
        Models.AccountRequirements as Schema.Schema<Models.AccountRequirements, any, any>
    )
  ),
  settings: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.AccountSettings, any, any> =>
          Models.AccountSettings as Schema.Schema<Models.AccountSettings, any, any>
      )
    )
  ),
  tos_acceptance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountTosAcceptance, any, any> =>
        Models.AccountTosAcceptance as Schema.Schema<Models.AccountTosAcceptance, any, any>
    )
  ),
  type: Schema.optional(Schema.Literal("custom", "express", "none", "standard"))
})
