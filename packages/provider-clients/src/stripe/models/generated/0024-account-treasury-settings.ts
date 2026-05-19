import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountTreasurySettings = Schema.Struct({
  tos_acceptance: Schema.optional(Schema.suspend((): typeof Models.AccountTermsOfService => Models.AccountTermsOfService)),
})
export type AccountTreasurySettings = typeof AccountTreasurySettings.Type
