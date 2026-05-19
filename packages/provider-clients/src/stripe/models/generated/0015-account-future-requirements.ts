import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountFutureRequirements = Schema.Struct({
  alternatives: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.AccountRequirementsAlternative => Models.AccountRequirementsAlternative))),
  current_deadline: Schema.NullOr(Schema.Number),
  currently_due: Schema.NullOr(Schema.Array(Schema.String)),
  disabled_reason: Schema.NullOr(Schema.Literal("action_required.requested_capabilities", "listed", "other", "platform_paused", "rejected.fraud", "rejected.incomplete_verification", "rejected.listed", "rejected.other", "rejected.platform_fraud", "rejected.platform_other", "rejected.platform_terms_of_service", "rejected.terms_of_service", "requirements.past_due", "requirements.pending_verification", "under_review")),
  errors: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.AccountRequirementsError => Models.AccountRequirementsError))),
  eventually_due: Schema.NullOr(Schema.Array(Schema.String)),
  past_due: Schema.NullOr(Schema.Array(Schema.String)),
  pending_verification: Schema.NullOr(Schema.Array(Schema.String)),
})
export type AccountFutureRequirements = typeof AccountFutureRequirements.Type
