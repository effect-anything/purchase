import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountTreasurySettings = Schema.Struct({
  tos_acceptance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountTermsOfService, any, any> =>
        Models.AccountTermsOfService as Schema.Schema<Models.AccountTermsOfService, any, any>
    )
  )
})
export type AccountTreasurySettings = typeof AccountTreasurySettings.Type
