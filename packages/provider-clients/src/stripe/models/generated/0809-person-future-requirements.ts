import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PersonFutureRequirements = Schema.Struct({
  alternatives: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.AccountRequirementsAlternative, any, any> =>
          Models.AccountRequirementsAlternative as Schema.Schema<Models.AccountRequirementsAlternative, any, any>
      )
    )
  ),
  currently_due: Schema.Array(Schema.String),
  errors: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.AccountRequirementsError, any, any> =>
        Models.AccountRequirementsError as Schema.Schema<Models.AccountRequirementsError, any, any>
    )
  ),
  eventually_due: Schema.Array(Schema.String),
  past_due: Schema.Array(Schema.String),
  pending_verification: Schema.Array(Schema.String)
})
export type PersonFutureRequirements = typeof PersonFutureRequirements.Type
