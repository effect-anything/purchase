import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountCardIssuingSettings = Schema.Struct({
  tos_acceptance: Schema.optional(Schema.suspend((): typeof Models.CardIssuingAccountTermsOfService => Models.CardIssuingAccountTermsOfService)),
})
export type AccountCardIssuingSettings = typeof AccountCardIssuingSettings.Type
