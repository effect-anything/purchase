import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ExternalAccountRequirements = Schema.Struct({
  currently_due: Schema.NullOr(Schema.Array(Schema.String)),
  errors: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.AccountRequirementsError, any, any> =>
          Models.AccountRequirementsError as Schema.Schema<Models.AccountRequirementsError, any, any>
      )
    )
  ),
  past_due: Schema.NullOr(Schema.Array(Schema.String)),
  pending_verification: Schema.NullOr(Schema.Array(Schema.String))
})
export type ExternalAccountRequirements = typeof ExternalAccountRequirements.Type
