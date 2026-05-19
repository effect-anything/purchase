import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PersonAdditionalTosAcceptances = Schema.Struct({
  account: Schema.NullOr(Schema.suspend((): typeof Models.PersonAdditionalTosAcceptance => Models.PersonAdditionalTosAcceptance)),
})
export type PersonAdditionalTosAcceptances = typeof PersonAdditionalTosAcceptances.Type
