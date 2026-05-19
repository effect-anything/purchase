import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PersonFutureRequirements = Schema.Struct({
  alternatives: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.AccountRequirementsAlternative => Models.AccountRequirementsAlternative))),
  currently_due: Schema.Array(Schema.String),
  errors: Schema.Array(Schema.suspend((): typeof Models.AccountRequirementsError => Models.AccountRequirementsError)),
  eventually_due: Schema.Array(Schema.String),
  past_due: Schema.Array(Schema.String),
  pending_verification: Schema.Array(Schema.String),
})
export type PersonFutureRequirements = typeof PersonFutureRequirements.Type
