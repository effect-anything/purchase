import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountCardIssuingSettings = Schema.Struct({
  tos_acceptance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CardIssuingAccountTermsOfService, any, any> =>
        Models.CardIssuingAccountTermsOfService as Schema.Schema<Models.CardIssuingAccountTermsOfService, any, any>
    )
  )
})
export type AccountCardIssuingSettings = typeof AccountCardIssuingSettings.Type
