import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputeEvidenceDetails = Schema.Struct({
  due_by: Schema.NullOr(Schema.Number),
  enhanced_eligibility: Schema.suspend(
    (): Schema.Schema<Models.DisputeEnhancedEligibility, any, any> =>
      Models.DisputeEnhancedEligibility as Schema.Schema<Models.DisputeEnhancedEligibility, any, any>
  ),
  has_evidence: Schema.Boolean,
  past_due: Schema.Boolean,
  submission_count: Schema.Number
})
export type DisputeEvidenceDetails = typeof DisputeEvidenceDetails.Type
