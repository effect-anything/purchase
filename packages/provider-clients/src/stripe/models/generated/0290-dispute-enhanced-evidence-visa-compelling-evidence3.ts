import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DisputeEnhancedEvidenceVisaCompellingEvidence3 = Schema.Struct({
  disputed_transaction: Schema.NullOr(Schema.suspend((): typeof Models.DisputeVisaCompellingEvidence3DisputedTransaction => Models.DisputeVisaCompellingEvidence3DisputedTransaction)),
  prior_undisputed_transactions: Schema.Array(Schema.suspend((): typeof Models.DisputeVisaCompellingEvidence3PriorUndisputedTransaction => Models.DisputeVisaCompellingEvidence3PriorUndisputedTransaction)),
})
export type DisputeEnhancedEvidenceVisaCompellingEvidence3 = typeof DisputeEnhancedEvidenceVisaCompellingEvidence3.Type
