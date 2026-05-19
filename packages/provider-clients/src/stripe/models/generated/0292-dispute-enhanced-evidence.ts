import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DisputeEnhancedEvidence = Schema.Struct({
  visa_compelling_evidence_3: Schema.optional(Schema.suspend((): typeof Models.DisputeEnhancedEvidenceVisaCompellingEvidence3 => Models.DisputeEnhancedEvidenceVisaCompellingEvidence3)),
  visa_compliance: Schema.optional(Schema.suspend((): typeof Models.DisputeEnhancedEvidenceVisaCompliance => Models.DisputeEnhancedEvidenceVisaCompliance)),
})
export type DisputeEnhancedEvidence = typeof DisputeEnhancedEvidence.Type
